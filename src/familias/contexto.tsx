import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { misRecetarios } from './api'
import { recordarFamilia } from './actual'
import type { Familia } from './tipos'
import { useSesion } from '../nucleo/sesion'

/**
 * En qué recetario se está.
 *
 * Todo lo demás cuelga de aquí: las recetas que se leen, las que se
 * escriben y la carpeta donde van las fotos. Vive en un contexto porque
 * lo necesitan la capa de datos y media docena de pantallas, y pasarlo de
 * mano en mano sería un reguero.
 */
interface ContextoFamilia {
  /** El recetario abierto, o null si aún no pertenece a ninguno. */
  familia: Familia | null
  /** Todos los suyos, por si algún día pertenece a más de uno. */
  todas: Familia[]
  cargando: boolean
  error: unknown
  /** Tras crear uno o entrar con código. */
  entrar: (familia: Familia) => void
  recargar: () => void
}

const Contexto = createContext<ContextoFamilia | undefined>(undefined)

export function ProveedorFamilia({ children }: { children: ReactNode }) {
  const { usuarioId } = useSesion()
  const [todas, setTodas] = useState<Familia[]>([])
  const [familia, setFamilia] = useState<Familia | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const recargar = useCallback(() => {
    if (!usuarioId) {
      setTodas([])
      setFamilia(null)
      setCargando(false)
      return
    }

    setCargando(true)
    misRecetarios()
      .then((suyas) => {
        setTodas(suyas)
        // Con uno solo, que es lo normal, no hay nada que elegir.
        setFamilia(suyas[0] ?? null)
        setError(null)
      })
      .catch(setError)
      .finally(() => setCargando(false))
  }, [usuarioId])

  useEffect(recargar, [recargar])

  // La capa de datos lo lee desde fuera de React para saber dónde
  // guardar cada receta y cada foto.
  useEffect(() => {
    recordarFamilia(familia?.id ?? null)
  }, [familia])

  const entrar = useCallback((nueva: Familia) => {
    setTodas((previas) =>
      previas.some((f) => f.id === nueva.id) ? previas : [...previas, nueva],
    )
    setFamilia(nueva)
  }, [])

  const valor = useMemo<ContextoFamilia>(
    () => ({ familia, todas, cargando, error, entrar, recargar }),
    [familia, todas, cargando, error, entrar, recargar],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFamilia(): ContextoFamilia {
  const contexto = useContext(Contexto)
  if (!contexto) {
    throw new Error('useFamilia tiene que usarse dentro de <ProveedorFamilia>')
  }
  return contexto
}

