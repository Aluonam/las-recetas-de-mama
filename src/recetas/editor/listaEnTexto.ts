import { nuevoId } from '../formato'
import type { Material, Truco } from '../tipos'

/**
 * Listas escritas de una tirada, una cosa por línea.
 *
 * Se usa donde cada elemento es una frase suelta —los cacharros, los
 * trucos—: ahí escribir seguido gana de calle a una fila con su botón de
 * añadir por cada cosa.
 *
 * Los ingredientes NO van por aquí. Se probó, y se escribían muy a
 * gusto, pero había que adivinar dónde acaba el nombre y si lo de
 * después es un número o «un puñado», y eso se equivoca. Tienen sus tres
 * casillas, con la medida elegida de una lista.
 *
 * Funciones puras a propósito, sin React: son la parte que puede
 * equivocarse, y así se prueban solas.
 */

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
