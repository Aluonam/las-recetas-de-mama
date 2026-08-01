import { letraDe, tituloParaOrdenar } from '../indice/agrupar'
import type { RecetaResumen } from '../tipos'

/**
 * De qué está hecho el libro.
 *
 * Un libro no es una pila de recetas: es una pila de hojas, y algunas no
 * son recetas. Cuando una letra tiene varias, delante va la suya, como
 * en los tomos antiguos, donde la B empieza con la lista de lo que hay
 * en la B.
 *
 * Solo cuando hay varias. Poner un índice de un renglón delante de una
 * receta única sería una hoja gastada para decir lo que ya dice la
 * pestaña del canto.
 */
export type Hoja =
  | { tipo: 'indice'; letra: string; recetas: RecetaResumen[] }
  | { tipo: 'receta'; letra: string; resumen: RecetaResumen }

/** Un libro va en orden, ignorando el artículo del título. */
export function ordenarComoLibro(recetas: RecetaResumen[]): RecetaResumen[] {
  return [...recetas].sort((a, b) =>
    tituloParaOrdenar(a.titulo).localeCompare(tituloParaOrdenar(b.titulo), 'es'),
  )
}

/**
 * Con qué se identifica cada hoja.
 *
 * Hace falta para numerar las páginas: el número sale de la posición en
 * el tomo entero, no en lo que tengas delante después de buscar, y para
 * cruzar las dos listas hay que poder reconocer la misma hoja en las
 * dos.
 */
export const claveDe = (hoja: Hoja) =>
  hoja.tipo === 'receta' ? `r:${hoja.resumen.id}` : `i:${hoja.letra}`

export function construirHojas(enOrden: RecetaResumen[]): Hoja[] {
  const hojas: Hoja[] = []
  let letraAbierta: string | null = null
  let delaLetra: RecetaResumen[] = []

  const cerrarLetra = () => {
    if (!letraAbierta || delaLetra.length === 0) return

    if (delaLetra.length > 1) {
      hojas.push({ tipo: 'indice', letra: letraAbierta, recetas: delaLetra })
    }

    for (const resumen of delaLetra) {
      hojas.push({ tipo: 'receta', letra: letraAbierta, resumen })
    }
  }

  for (const resumen of enOrden) {
    const letra = letraDe(resumen.titulo)
    if (letra !== letraAbierta) {
      cerrarLetra()
      letraAbierta = letra
      delaLetra = []
    }
    delaLetra.push(resumen)
  }

  cerrarLetra()
  return hojas
}

/**
 * Por dónde se abre cada letra.
 *
 * Es su índice si lo tiene, y si no, su única receta. Es lo que hace que
 * la pestaña del canto lleve al sitio útil: en una letra con ocho
 * recetas, a la lista; en una con una, a la receta.
 */
export function comienzoDeCadaLetra(hojas: Hoja[]): Map<string, number> {
  const comienzos = new Map<string, number>()

  hojas.forEach((hoja, posicion) => {
    if (!comienzos.has(hoja.letra)) comienzos.set(hoja.letra, posicion)
  })

  return comienzos
}
