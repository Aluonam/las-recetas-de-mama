import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from './supabase'
import { HAY_SUPABASE } from './entorno'

/**
 * La sesión se abre sola.
 *
 * Antes había que pedir un enlace al correo, ir al buzón y volver. Para
 * un recetario que se abre con las manos llenas de harina, ese peaje era
 * más caro que lo que protegía.
 *
 * Ahora se crea una sesión anónima nada más entrar. No identifica a
 * nadie: solo sirve para que la base pueda decir «este de aquí pertenece
 * a este recetario». La llave de verdad es el código familiar.
 *
 * El correo se sigue pidiendo al entrar, pero como etiqueta —para saber
 * quién metió cada receta—, no como credencial.
 */
interface ContextoSesion {
  usuarioId: string | null
  cargando: boolean
  error: unknown
  salir: () => Promise<void>
}

const Contexto = createContext<ContextoSesion | undefined>(undefined)

/**
 * Una sesión anónima a la vez, aunque pregunten dos.
 *
 * En desarrollo React ejecuta los efectos por duplicado a propósito, para
 * destapar justo este tipo de fallos. Sin esta guarda se creaban dos
 * cuentas anónimas en cada carga —milisegundos aparte— y la base se
 * llenaba de identidades huérfanas.
 *
 * Fuera de React porque el guardián tiene que sobrevivir a que el
 * componente se monte, se desmonte y se vuelva a montar.
 */
let abriendoSesion: Promise<string | null> | null = null

async function asegurarSesion(): Promise<string | null> {
  const { data } = await supabase.auth.getSession()
  if (data.session) return data.session.user.id

  abriendoSesion ??= supabase.auth
    .signInAnonymously()
    .then(({ data: nueva, error }) => {
      if (error) throw error
      return nueva.session?.user.id ?? null
    })
    .finally(() => {
      abriendoSesion = null
    })

  return abriendoSesion
}

/** Identidad ficticia del modo demostración. */
const USUARIO_DEMO = '00000000-0000-4000-8000-000000000001'

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [usuarioId, setUsuarioId] = useState<string | null>(
    HAY_SUPABASE ? null : USUARIO_DEMO,
  )
  const [cargando, setCargando] = useState(HAY_SUPABASE)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    if (!HAY_SUPABASE) return

    let vigente = true

    const abrir = async () => {
      if (vigente) {
        setCargando(true)
        setError(null)
      }

      try {
        // Supabase guarda la sesión en el navegador, así que en las
        // visitas siguientes se reaprovecha y no se crea otra.
        const id = await asegurarSesion()
        if (vigente) setUsuarioId(id)
      } catch (e) {
        if (vigente) setError(e)
      } finally {
        if (vigente) setCargando(false)
      }
    }

    abrir()

    const { data } = supabase.auth.onAuthStateChange((evento, sesion) => {
      if (sesion) {
        setUsuarioId(sesion.user.id)
        return
      }

      setUsuarioId(null)

      /**
       * Al salir hay que abrir otra sesión anónima enseguida.
       *
       * Sin esto, «Salir» dejaba la app sin sesión y sin forma de
       * conseguir otra: la primera se creaba solo al cargar la página, así
       * que quedaba una pantalla de error de la que no se salía.
       *
       * Lo que se busca al salir es volver a la pantalla del código, y
       * para llegar ahí hace falta una sesión nueva, no ninguna.
       */
      if (evento === 'SIGNED_OUT') abrir()
    })

    return () => {
      vigente = false
      data.subscription.unsubscribe()
    }
  }, [])

  const valor = useMemo<ContextoSesion>(
    () => ({
      usuarioId,
      cargando,
      error,
      salir: async () => {
        if (HAY_SUPABASE) await supabase.auth.signOut()
      },
    }),
    [usuarioId, cargando, error],
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
