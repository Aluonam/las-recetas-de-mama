import { useCallback, useEffect, useRef, useState } from 'react'

export type Sentido = 'adelante' | 'atras'

/** Píxeles mínimos de arrastre para contar como pasar hoja. */
const ARRASTRE_MINIMO = 55

/**
 * Pasar hojas: con los botones, con las flechas del teclado y deslizando
 * el dedo. Las tres cosas hacen lo mismo, así que viven juntas.
 */
export function useNavegacionLibro(total: number) {
  const [indice, setIndice] = useState(0)
  const [sentido, setSentido] = useState<Sentido>('adelante')
  const inicioX = useRef<number | null>(null)

  const pasar = useCallback(
    (haciaDonde: Sentido) => {
      setIndice((actual) => {
        const siguiente = haciaDonde === 'adelante' ? actual + 1 : actual - 1
        // El libro tiene principio y final: no da la vuelta.
        if (siguiente < 0 || siguiente >= total) return actual
        setSentido(haciaDonde)
        return siguiente
      })
    },
    [total],
  )

  /** Salta a una receta concreta, por ejemplo desde el buscador. */
  const irA = useCallback(
    (destino: number) => {
      setIndice((actual) => {
        if (destino < 0 || destino >= total) return actual
        setSentido(destino > actual ? 'adelante' : 'atras')
        return destino
      })
    },
    [total],
  )

  // Si cambia el filtro y hay menos recetas, el índice puede quedar fuera.
  useEffect(() => {
    setIndice((actual) => (actual >= total ? Math.max(0, total - 1) : actual))
  }, [total])

  useEffect(() => {
    const alPulsar = (evento: KeyboardEvent) => {
      // Si se está escribiendo en el buscador, las flechas son suyas.
      const activo = document.activeElement
      if (
        activo instanceof HTMLInputElement ||
        activo instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (evento.key === 'ArrowRight') pasar('adelante')
      if (evento.key === 'ArrowLeft') pasar('atras')
    }

    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [pasar])

  const gestos = {
    onTouchStart: (evento: React.TouchEvent) => {
      inicioX.current = evento.touches[0].clientX
    },
    onTouchEnd: (evento: React.TouchEvent) => {
      if (inicioX.current === null) return
      const recorrido = evento.changedTouches[0].clientX - inicioX.current
      inicioX.current = null

      if (Math.abs(recorrido) < ARRASTRE_MINIMO) return
      pasar(recorrido < 0 ? 'adelante' : 'atras')
    },
  }

  return { indice, sentido, pasar, irA, gestos }
}
