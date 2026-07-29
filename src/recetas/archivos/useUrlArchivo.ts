import { useEffect, useState } from 'react'
import { esDirecta, urlDeArchivo } from '../almacenamiento'

/**
 * Resuelve lo guardado en una receta a algo que un `src` pueda usar.
 *
 * Con el bucket privado no hay direcciones permanentes: hay que pedir un
 * enlace firmado. Lo que ya es utilizable —data URLs del modo
 * demostración, o direcciones antiguas de cuando el bucket era público—
 * se devuelve al momento y sin pasar por la red.
 */
export function useUrlArchivo(guardado?: string | null) {
  const [url, setUrl] = useState<string | null>(() =>
    guardado && esDirecta(guardado) ? guardado : null,
  )

  useEffect(() => {
    if (!guardado) {
      setUrl(null)
      return
    }

    if (esDirecta(guardado)) {
      setUrl(guardado)
      return
    }

    let vigente = true
    urlDeArchivo(guardado)
      .then((firmada) => {
        // Si se cambió de receta mientras se firmaba, no pisar la nueva.
        if (vigente) setUrl(firmada)
      })
      .catch(() => {
        // Una foto que no carga no debe tumbar la receta entera: se queda
        // sin imagen y el resto se lee igual.
        if (vigente) setUrl(null)
      })

    return () => {
      vigente = false
    }
  }, [guardado])

  return url
}
