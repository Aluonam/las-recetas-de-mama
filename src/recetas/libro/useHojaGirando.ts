import { useEffect, useRef, useState } from 'react'
import type { Receta } from '../tipos'
import type { Hoja } from './hojas'
import { DOS_PAGINAS } from './useDosPaginas'

/** Lo que tarda la hoja en caer. Debe coincidir con el CSS. */
const DURACION = 620

export interface Pagina {
  hoja: Hoja
  /** Solo las hojas de receta la traen, y solo cuando ha llegado. */
  receta: Receta | null
}


/**
 * La hoja que gira, con la página que estabas leyendo puesta encima.
 *
 * Para que se lea como un libro no basta con girar un papel en blanco:
 * hay que congelar la página anterior y ponerla en la cara de delante de
 * la hoja. Así, al pasar, lo que se levanta y se da la vuelta es
 * exactamente lo que estabas mirando, y debajo aparece lo siguiente.
 *
 * Se apaga con un temporizador porque el elemento aparece y desaparece:
 * escuchar el fin de la animación en algo que se desmonta sería más
 * frágil que contar.
 *
 * No gira en la primera carga: entrar en el recetario no es pasar una
 * hoja.
 */
export function useHojaGirando(actual: Pagina | null, clave: string | null) {
  const [congelada, setCongelada] = useState<Pagina | null>(null)
  const anterior = useRef<Pagina | null>(null)
  const primera = useRef(true)

  useEffect(() => {
    if (!clave) return

    if (primera.current) {
      primera.current = false
      return
    }

    /**
     * En una sola página no se congela nada.
     *
     * Allí no hay hoja girando, así que quedarse con la anterior no
     * taparía nada: solo retrasaría medio segundo la receta nueva, sin
     * motivo visible.
     */
    if (!window.matchMedia(DOS_PAGINAS).matches) return

    // `anterior` todavía tiene la página del render pasado: la que hay
    // que enseñar girando.
    setCongelada(anterior.current)
    const reloj = window.setTimeout(() => setCongelada(null), DURACION)
    return () => window.clearTimeout(reloj)
  }, [clave])

  // Después de cada render, la actual pasa a ser la anterior.
  useEffect(() => {
    if (actual) anterior.current = actual
  })

  return congelada
}
