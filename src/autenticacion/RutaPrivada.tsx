import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSesion } from '../nucleo/sesion'
import { Cargando } from '../ui/Estado'

/** Manda a /entrar a quien no tenga sesión. */
export function RutaPrivada({ children }: { children: ReactNode }) {
  const { sesion, cargando } = useSesion()

  if (cargando) return <Cargando que="Abriendo el recetario" />
  if (!sesion) return <Navigate to="/entrar" replace />
  return <>{children}</>
}
