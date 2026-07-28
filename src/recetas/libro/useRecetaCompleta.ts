import { useEffect, useRef, useState } from 'react'
import { obtenerReceta } from '../api'
import type { Receta } from '../tipos'

/**
 * Trae la receta entera de la hoja abierta.
 *
 * Guarda en memoria las ya vistas: pasar hojas adelante y atrás es lo que
 * más se hace en un libro, y volver a pedir lo mismo cada vez daría un
 * parpadeo en cada giro.
 */
export function useRecetaCompleta(id?: string) {
  const vistas = useRef(new Map<string, Receta>())
  const [receta, setReceta] = useState<Receta | null>(null)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    if (!id) {
      setReceta(null)
      return
    }

    const guardada = vistas.current.get(id)
    if (guardada) {
      setReceta(guardada)
      return
    }

    let vigente = true
    setReceta(null)
    setError(null)

    obtenerReceta(id)
      .then((completa) => {
        vistas.current.set(id, completa)
        // Si ya se pasó de hoja mientras cargaba, no pisar la nueva.
        if (vigente) setReceta(completa)
      })
      .catch((e) => {
        if (vigente) setError(e)
      })

    return () => {
      vigente = false
    }
  }, [id])

  return { receta, error }
}
