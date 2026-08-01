import { familiaActual } from '../../familias/actual'
import type { RecetaEditable } from '../tipos'

/**
 * El borrador de la receta que se está escribiendo.
 *
 * Escribir una receta lleva su rato: se cuenta la historia, se recuerdan
 * los ingredientes, se busca la foto. Hasta ahora todo eso vivía
 * únicamente en la memoria de la pestaña, así que el botón «atrás» del
 * móvil, una llamada que descarga la página o un dedo en el sitio
 * equivocado se llevaban veinte minutos de trabajo sin decir ni una
 * palabra.
 *
 * Se guarda en el navegador, no en el servidor, y a propósito: es un
 * papel a medias, y un papel a medias no se le enseña a la familia hasta
 * que quien lo escribe diga que ya está.
 *
 * Solo hay uno a la vez. Nadie escribe dos recetas en paralelo, y una
 * lista de borradores sería una pantalla más que mantener para un caso
 * que no pasa.
 */

const CLAVE = 'receta-borrador'

/** Pasado un mes, un borrador ya no es «lo que estaba escribiendo». */
const DIAS_QUE_DURA = 30

/**
 * Tope de tamaño.
 *
 * En modo demostración las fotos viajan dentro de la receta como texto,
 * y ahí se llena el hueco del navegador enseguida. Antes de pasarse, se
 * deja de guardar: perder el borrador es malo, pero romper el guardado
 * de todo lo demás es peor.
 */
const TOPE = 1_000_000

interface Guardado {
  familiaId: string | null
  receta: RecetaEditable
  cuando: number
}

/** ¿Hay algo escrito, o sigue en blanco? */
export function tieneAlgo(receta: RecetaEditable): boolean {
  const { procedencia } = receta

  return Boolean(
    receta.titulo.trim() ||
      receta.descripcion?.trim() ||
      receta.porQueEspecial?.trim() ||
      receta.raciones?.trim() ||
      receta.tiempoMinutos ||
      receta.fotoPortadaUrl ||
      receta.audioUrl ||
      receta.ocasiones.length ||
      receta.ingredientes.length ||
      receta.materiales.length ||
      receta.pasos.length ||
      receta.trucos.length ||
      procedencia.autorNombre?.trim() ||
      procedencia.autorRelacion?.trim() ||
      procedencia.aprendidaDe?.trim() ||
      procedencia.anioOrigen,
  )
}

export function guardarBorrador(receta: RecetaEditable): void {
  try {
    const texto = JSON.stringify({
      familiaId: familiaActual(),
      receta,
      cuando: Date.now(),
    } satisfies Guardado)

    if (texto.length > TOPE) return
    localStorage.setItem(CLAVE, texto)
  } catch {
    // Ventana privada, o sin sitio. Se sigue escribiendo igual: el
    // borrador es una red, no el suelo.
  }
}

/**
 * El borrador que quedó pendiente, si vale la pena ofrecerlo.
 *
 * Se descarta el de otro recetario: puestos a equivocarse, es peor
 * meterle a alguien las croquetas de su suegra en el recetario de su
 * madre que perder un borrador.
 */
export function leerBorrador(): RecetaEditable | null {
  try {
    const texto = localStorage.getItem(CLAVE)
    if (!texto) return null

    const guardado = JSON.parse(texto) as Guardado
    const dias = (Date.now() - guardado.cuando) / 86_400_000

    if (dias > DIAS_QUE_DURA || guardado.familiaId !== familiaActual()) {
      borrarBorrador()
      return null
    }

    return tieneAlgo(guardado.receta) ? guardado.receta : null
  } catch {
    // Guardado por una versión anterior, o a medio escribir. Fuera.
    borrarBorrador()
    return null
  }
}

export function borrarBorrador(): void {
  try {
    localStorage.removeItem(CLAVE)
  } catch {
    // Igual que al guardar: si no se puede, no pasa nada.
  }
}
