import { useEffect, useRef, useState } from 'react'
import type { Receta, RecetaResumen } from '../tipos'

/** Lo que tarda la hoja en caer. Debe coincidir con el CSS. */
const DURACION = 620

export interface Pagina {
  resumen: RecetaResumen
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
export function useHojaGirando(actual: Pagina | null) {
  const [congelada, setCongelada] = useState<Pagina | null>(null)
  const anterior = useRef<Pagina | null>(null)
  const primera = useRef(true)
  const id = actual?.resumen.id

  useEffect(() => {
    if (!id) return

    if (primera.current) {
      primera.current = false
      return
    }

    // `anterior` todavía tiene la página del render pasado: la que hay
    // que enseñar girando.
    setCongelada(anterior.current)
    const reloj = window.setTimeout(() => setCongelada(null), DURACION)
    return () => window.clearTimeout(reloj)
  }, [id])

  // Después de cada render, la actual pasa a ser la anterior.
  useEffect(() => {
    if (actual) anterior.current = actual
  })

  return congelada
}
