import type { RecetaResumen } from '../tipos'

/**
 * Ordenación y agrupación del índice.
 *
 * Funciones puras, sin React ni red: se prueban con un `expect` y se
 * reutilizan el día que haya que exportar el recetario a PDF, donde el
 * índice del final es exactamente esto.
 */

export type Agrupacion = 'plato' | 'quien' | 'ocasion'

export interface Grupo {
  /** «C», «Abuela Carmen», «Nochebuena». */
  clave: string
  recetas: RecetaResumen[]
}

const SIN_FIRMAR = 'Sin firmar'
const SIN_OCASION = 'Sin ocasión'

/** Artículos que un recetario de verdad ignora al ordenar. */
const ARTICULOS = ['el ', 'la ', 'los ', 'las ', 'un ', 'una ', 'unos ', 'unas ']

/**
 * Título tal como debe ordenarse.
 *
 * «Las lentejas de mamá» va en la L de lentejas, no en la de «Las». Es lo
 * que hace cualquier libro de cocina y lo que espera quien busca.
 */
export function tituloParaOrdenar(titulo: string): string {
  const limpio = titulo.trim()
  const articulo = ARTICULOS.find((a) => limpio.toLowerCase().startsWith(a))
  return articulo ? limpio.slice(articulo.length).trim() : limpio
}

/**
 * Letra bajo la que se archiva.
 *
 * Los acentos no separan: «Álbóndigas» va con la A. La eñe sí es letra
 * propia en español y tiene su sitio entre la N y la O.
 */
export function letraDe(texto: string): string {
  const primera = tituloParaOrdenar(texto).charAt(0).toUpperCase()
  if (!primera) return '#'
  if (primera === 'Ñ') return 'Ñ'

  // NFD separa la letra de su tilde y deja la letra base delante, así que
  // el primer carácter ya es la letra limpia: «Á» pasa a «A» + tilde.
  // Sin expresión regular a propósito: un rango de tildes escrito con
  // caracteres literales se rompe en cuanto alguien reguarda el archivo.
  const base = primera.normalize('NFD').charAt(0)
  return /^[A-Z]$/.test(base) ? base : '#'
}

const comparar = (a: string, b: string) => a.localeCompare(b, 'es')

/** Ordena recetas por su título, ignorando el artículo inicial. */
function porTitulo(recetas: RecetaResumen[]): RecetaResumen[] {
  return [...recetas].sort((a, b) =>
    comparar(tituloParaOrdenar(a.titulo), tituloParaOrdenar(b.titulo)),
  )
}

/**
 * Reparte las recetas en grupos.
 *
 * En «ocasion» una receta puede salir en varios grupos, porque las
 * croquetas se hacen en Nochebuena y también los domingos. Es correcto:
 * el índice es para encontrarlas, no para contarlas.
 */
export function agrupar(
  recetas: RecetaResumen[],
  modo: Agrupacion,
): Grupo[] {
  const cajones = new Map<string, RecetaResumen[]>()

  const meter = (clave: string, receta: RecetaResumen) => {
    const cajon = cajones.get(clave)
    if (cajon) cajon.push(receta)
    else cajones.set(clave, [receta])
  }

  for (const receta of recetas) {
    if (modo === 'plato') {
      meter(letraDe(receta.titulo), receta)
    } else if (modo === 'quien') {
      meter(receta.autorNombre?.trim() || SIN_FIRMAR, receta)
    } else {
      if (receta.ocasiones.length === 0) meter(SIN_OCASION, receta)
      else for (const ocasion of receta.ocasiones) meter(ocasion, receta)
    }
  }

  return [...cajones.entries()]
    .map(([clave, suyas]) => ({ clave, recetas: porTitulo(suyas) }))
    .sort((a, b) => {
      // Los cajones de descarte van al final, no en su letra.
      const sobraA = a.clave === SIN_FIRMAR || a.clave === SIN_OCASION
      const sobraB = b.clave === SIN_FIRMAR || b.clave === SIN_OCASION
      if (sobraA !== sobraB) return sobraA ? 1 : -1
      return comparar(a.clave, b.clave)
    })
}

/** Identificador de anclaje para saltar a un grupo desde la guía. */
export const anclaDe = (clave: string) =>
  `grupo-${clave.toLowerCase().replace(/[^a-z0-9ñ]+/gi, '-')}`
