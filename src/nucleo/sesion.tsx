import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface ContextoSesion {
  sesion: Session | null
  cargando: boolean
  salir: () => Promise<void>
}

const Contexto = createContext<ContextoSesion | undefined>(undefined)

/** Mantiene la sesión viva y avisa a la app cuando cambia. */
export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Session | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session)
      setCargando(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      setSesion(nueva)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  const valor = useMemo<ContextoSesion>(
    () => ({
      sesion,
      cargando,
      salir: async () => {
        await supabase.auth.signOut()
      },
    }),
    [sesion, cargando],
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
