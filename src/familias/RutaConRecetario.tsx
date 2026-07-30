import type { ReactNode } from 'react'
import { useFamilia } from './contexto'
import { PaginaBienvenida } from './PaginaBienvenida'
import { Aviso, Cargando } from '../ui/Estado'
import { Marco } from '../ui/Marco'

/**
 * Exige pertenecer a un recetario.
 *
 * Quien tiene sesión pero todavía no está en ninguno ve la bienvenida:
 * crear el suyo o entrar con un código. Sin esto, el recetario saldría
 * vacío sin explicar por qué, que es la peor forma de recibir a alguien.
 */
export function RutaConRecetario({ children }: { children: ReactNode }) {
  const { familia, cargando, error } = useFamilia()

  if (cargando) return <Cargando que="Buscando tu recetario" />

  if (error != null) {
    return (
      <Marco navegacion={false}>
        <Aviso error={error} />
      </Marco>
    )
  }

  if (!familia) {
    return (
      <Marco navegacion={false}>
        <PaginaBienvenida />
      </Marco>
    )
  }

  return <>{children}</>
}
