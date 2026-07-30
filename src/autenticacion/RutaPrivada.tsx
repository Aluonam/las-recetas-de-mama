import type { ReactNode } from 'react'
import { useSesion } from '../nucleo/sesion'
import { Aviso, Cargando } from '../ui/Estado'

/**
 * Espera a que la sesión esté abierta.
 *
 * Ya no manda a ninguna pantalla de acceso: la sesión se crea sola. Lo
 * único que puede fallar aquí es que las sesiones anónimas estén
 * desactivadas en Supabase, y en ese caso hay que decirlo con claridad
 * porque desde fuera parecería que la app está rota.
 */
export function RutaPrivada({ children }: { children: ReactNode }) {
  const { usuarioId, cargando, error } = useSesion()

  if (cargando) return <Cargando que="Abriendo el recetario" />

  if (error != null || !usuarioId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="mb-4 text-2xl">No se ha podido abrir la sesión</h1>
        <Aviso error={error ?? new Error('La sesión no llegó a abrirse.')} />
        <p className="mt-4 text-tinta-suave">
          Si esto acaba de montarse, lo más probable es que falte activar
          las sesiones anónimas en Supabase:{' '}
          <strong>Authentication → Providers → Anonymous sign-ins</strong>.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
