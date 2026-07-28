import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from './supabase'
import { HAY_SUPABASE } from './entorno'

/**
 * Sesión de la persona que usa la app.
 *
 * El contexto expone `usuarioId` y `correo`, no el objeto Session de
 * Supabase: las pantallas no tienen por qué conocer el tipo del proveedor.
 * Eso es justo lo que permite que el modo demostración funcione sin tocar
 * ninguna vista.
 */
interface ContextoSesion {
  usuarioId: string | null
  correo: string | null
  cargando: boolean
  salir: () => Promise<void>
}

const Contexto = createContext<ContextoSesion | undefined>(undefined)

/** Persona ficticia del modo demostración. */
const USUARIO_DEMO = {
  id: '00000000-0000-4000-8000-000000000001',
  correo: 'demostración',
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuarioId, setUsuarioId] = useState<string | null>(
    HAY_SUPABASE ? null : USUARIO_DEMO.id,
  )
  const [correo, setCorreo] = useState<string | null>(
    HAY_SUPABASE ? null : USUARIO_DEMO.correo,
  )
  const [cargando, setCargando] = useState(HAY_SUPABASE)

  useEffect(() => {
    // En modo demostración siempre hay sesión: no hay nada que consultar.
    if (!HAY_SUPABASE) return

    supabase.auth.getSession().then(({ data }) => {
      setUsuarioId(data.session?.user.id ?? null)
      setCorreo(data.session?.user.email ?? null)
      setCargando(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      setUsuarioId(sesion?.user.id ?? null)
      setCorreo(sesion?.user.email ?? null)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  const valor = useMemo<ContextoSesion>(
    () => ({
      usuarioId,
      correo,
      cargando,
      salir: async () => {
        if (HAY_SUPABASE) await supabase.auth.signOut()
      },
    }),
    [usuarioId, correo, cargando],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSesion(): ContextoSesion {
  const contexto = useContext(Contexto)
  if (!contexto) {
    throw new Error('useSesion tiene que usarse dentro de <ProveedorSesion>')
  }
  return contexto
}
