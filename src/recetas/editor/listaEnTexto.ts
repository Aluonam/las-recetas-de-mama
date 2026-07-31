import { nuevoId } from '../formato'
import type { Ingrediente, Material, Truco } from '../tipos'

/**
 * Listas escritas de una tirada, una cosa por línea.
 *
 * Antes cada ingrediente eran cinco casillas —nombre, medida de casa,
 * cantidad, unidad, nota— y una receta con doce ingredientes pedía
 * sesenta. Eso en una tablet no se rellena, se abandona.
 *
 * Ahora se escribe como se escribe en un papel:
 *
 *     Harina, 250 g
 *     Leche, un vaso de los del vino
 *     Sal
 *
 * Lo de después de la primera coma es la cantidad. Si son un número y
 * una unidad se guardan como tales, y si no, tal cual: «un puñado» dice
 * más que «30 g» cuando la receta la contó tu abuela, y el modelo
 * guarda las dos cosas por separado desde el principio.
 *
 * Funciones puras a propósito, sin React: son la parte que puede
 * equivocarse, y así se prueban solas.
 */

/** «250 g», «1,5 l», «2 cucharadas». Null si no es una medida contable. */
function comoMedida(texto: string): { cantidad: number; unidad: string | null } | null {
  const partes = texto.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/)
  if (!partes) return null

  const cantidad = Number(partes[1].replace(',', '.'))
  if (!Number.isFinite(cantidad)) return null

  const unidad = partes[2].trim()

  /**
   * «12 huevos» no es una medida, es la cantidad de un ingrediente que
   * ya se llama así. Se admite unidad vacía —«Huevos, 12»— y palabras
   * cortas, que es lo que son las unidades de verdad; lo demás se toma
   * por medida de casa: «2 vasos de los del vino» no cabe en una
   * columna de unidad.
   */
  if (unidad.split(/\s+/).filter(Boolean).length > 1) return null

  return { cantidad, unidad: unidad || null }
}

/** Parte una línea en «lo que es» y «cuánto», por la primera coma. */
function partir(linea: string): { nombre: string; resto: string } {
  const coma = linea.indexOf(',')
  if (coma === -1) return { nombre: linea.trim(), resto: '' }

  return {
    nombre: linea.slice(0, coma).trim(),
    resto: linea.slice(coma + 1).trim(),
  }
}

const enLineas = (texto: string) =>
  texto.split('\n').map((linea) => linea.trim()).filter(Boolean)

export function textoAIngredientes(texto: string): Ingrediente[] {
  return enLineas(texto).map((linea) => {
    const { nombre, resto } = partir(linea)
    const medida = resto ? comoMedida(resto) : null

    if (medida) {
      return {
        id: nuevoId(),
        nombre,
        cantidad: medida.cantidad,
        unidad: medida.unidad,
      }
    }

    return { id: nuevoId(), nombre, cantidadCasera: resto || null }
  })
}

export function ingredientesATexto(ingredientes: Ingrediente[]): string {
  return ingredientes
    .map((ingrediente) => {
      const exacta = [ingrediente.cantidad, ingrediente.unidad]
        .filter((parte) => parte !== null && parte !== undefined && parte !== '')
        .join(' ')

      const cuanto = ingrediente.cantidadCasera?.trim() || exacta
      return cuanto ? `${ingrediente.nombre}, ${cuanto}` : ingrediente.nombre
    })
    .join('\n')
}

export function textoAMateriales(texto: string): Material[] {
  return enLineas(texto).map((linea) => {
    const { nombre, resto } = partir(linea)
    return { id: nuevoId(), nombre, nota: resto || null }
  })
}

export function materialesATexto(materiales: Material[]): string {
  return materiales
    .map((material) =>
      material.nota?.trim()
        ? `${material.nombre}, ${material.nota.trim()}`
        : material.nombre,
    )
    .join('\n')
}

/**
 * Los trucos no se parten por comas: son frases enteras, y «Si se corta,
 * un chorrito de agua fría» se quedaría a la mitad. Aquí una línea es un
 * truco y punto.
 *
 * Los pasos siguen con sus filas de siempre, porque cada uno puede
 * llevar su foto y eso no cabe en una línea de texto.
 *
 * De quién era el truco no se escribe aquí, pero tampoco se tira: si la
 * línea sigue diciendo lo mismo, se le devuelve su firma. Sin esto,
 * editar la receta para cambiar una coma borraría en silencio el «lo
 * decía la abuela» de todos los demás.
 */
export function textoATrucos(texto: string, anteriores: Truco[]): Truco[] {
  return enLineas(texto).map((linea) => {
    const mismo = anteriores.find((truco) => truco.texto.trim() === linea)
    return mismo ? { ...mismo, texto: linea } : { id: nuevoId(), texto: linea }
  })
}

export const trucosATexto = (trucos: Truco[]) =>
  trucos.map((truco) => truco.texto).join('\n')
