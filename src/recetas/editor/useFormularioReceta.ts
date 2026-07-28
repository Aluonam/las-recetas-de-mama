import { useCallback, useEffect, useState } from 'react'
import { actualizarReceta, crearReceta, obtenerReceta } from '../api'
import { aEditable, recetaVacia } from '../tipos'
import type { RecetaEditable } from '../tipos'

/**
 * Estado del formulario de receta: cargar, editar y guardar.
 *
 * La página se queda solo con pintar campos. Toda la lógica vive aquí, así
 * que se puede probar sin montar la interfaz y crear/editar comparten
 * exactamente el mismo camino.
 */
export function useFormularioReceta(id?: string) {
  const [receta, setReceta] = useState<RecetaEditable | null>(
    id ? null : recetaVacia(),
  )
  const [cargando, setCargando] = useState(Boolean(id))
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    if (!id) return

    setCargando(true)
    obtenerReceta(id)
      .then((receta) => setReceta(aEditable(receta)))
      .catch(setError)
      .finally(() => setCargando(false))
  }, [id])

  /** Cambia uno o varios campos de la receta. */
  const cambiar = useCallback((parche: Partial<RecetaEditable>) => {
    setReceta((actual) => (actual ? { ...actual, ...parche } : actual))
  }, [])

  /** Devuelve el id de la receta guardada, o null si algo falló. */
  const guardar = useCallback(async (): Promise<string | null> => {
    if (!receta) return null

    setGuardando(true)
    setError(null)
    try {
      const guardada = id
        ? await actualizarReceta(id, receta)
        : await crearReceta(receta)
      return guardada.id
    } catch (e) {
      setError(e)
      return null
    } finally {
      setGuardando(false)
    }
  }, [id, receta])

  return { receta, cambiar, guardar, cargando, guardando, error, setError }
}
