import { useEffect, useRef, useState } from 'react'

/** Lo que tarda la hoja en caer. Debe coincidir con el CSS. */
const DURACION = 620

/**
 * Cuándo hay una hoja girando por encima.
 *
 * Se enciende al cambiar de receta y se apaga sola cuando la hoja ha
 * terminado de caer. Necesita un temporizador porque no hay forma de
 * saber desde React que una animación de CSS ha acabado sin escuchar su
 * evento, y aquí el elemento aparece y desaparece: escucharlo sería más
 * frágil que contar.
 *
 * No gira en la primera carga: entrar en el recetario no es pasar una
 * hoja, y arrancar con una animación de giro despista.
 */
export function useHojaGirando(recetaId: string | undefined) {
  const [girando, setGirando] = useState(false)
  const primera = useRef(true)

  useEffect(() => {
    if (!recetaId) return

    if (primera.current) {
      primera.current = false
      return
    }

    setGirando(true)
    const reloj = window.setTimeout(() => setGirando(false), DURACION)
    return () => window.clearTimeout(reloj)
  }, [recetaId])

  return girando
}
