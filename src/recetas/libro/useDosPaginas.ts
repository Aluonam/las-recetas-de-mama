import { useEffect, useState } from 'react'

/**
 * Cuándo el libro se abre de par en par.
 *
 * Tiene que decir exactamente lo mismo que `.doble-pagina` en el CSS. Si
 * los dos se separan, el libro se pinta con dos caras y se navega como
 * si tuviera una, o al revés.
 *
 * Hacen falta las dos condiciones. Sitio, porque dos páginas en 700
 * puntos no son dos páginas sino dos columnas; y forma apaisada, porque
 * es la del libro abierto.
 */
export const DOS_PAGINAS = '(width >= 64rem) and (orientation: landscape)'

/**
 * Se entera de girar la tablet.
 *
 * No basta con mirarlo al empezar: la tablet se voltea a media receta, y
 * ahí el libro tiene que cambiar de forma —de dos caras a una— sin
 * perder por dónde ibas.
 */
export function useDosPaginas(): boolean {
  const [dos, setDos] = useState(
    () =>
      typeof window !== 'undefined' && window.matchMedia(DOS_PAGINAS).matches,
  )

  useEffect(() => {
    const consulta = window.matchMedia(DOS_PAGINAS)
    const alCambiar = () => setDos(consulta.matches)

    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [])

  return dos
}
