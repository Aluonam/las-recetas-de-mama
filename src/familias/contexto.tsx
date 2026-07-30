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
  /**
   * Si quien mira es quien creó el recetario. Solo esa persona puede
   * borrar recetas; el resto ve y edita.
   */
  soyDuena: boolean
  /** Todos los suyos, por si algún día pertenece a más de uno. */
  todas: Familia[]
  cargando: boolean
  error: unknown
  /** Tras crear uno o entrar con código. */
  entrar: (familia: Familia) => void
  /** Cambiar al recetario que se diga, de entre los tuyos. */
  elegir: (familiaId: string) => void
  recargar: () => void
}

/**
 * Cuál estaba abierto.
 *
 * Se guarda porque hay idas y vueltas que remontan la app entera —salir a
 * verificar el correo y volver, sobre todo— y sin esto se abría siempre
 * el primero de la lista. Quien tiene dos recetarios acababa mirando el
 * que no era sin saber por qué.
 */
const CLAVE_ABIERTO = 'recetario-abierto'

function recordado(): string | null {
  try {
    return localStorage.getItem(CLAVE_ABIERTO)
  } catch {
    return null
  }
}

function recordar(id: string | null) {
  try {
    if (id) localStorage.setItem(CLAVE_ABIERTO, id)
    else localStorage.removeItem(CLAVE_ABIERTO)
  } catch {
    // Ventana privada: se abrirá el primero. Tampoco es grave.
  }
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
        // El que estaba abierto, si sigue siendo suyo. Si no, el primero.
        const antes = recordado()
        setFamilia(suyas.find((f) => f.id === antes) ?? suyas[0] ?? null)
        setError(null)
      })
      .catch(setError)
      .finally(() => setCargando(false))
  }, [usuarioId])

  useEffect(recargar, [recargar])

  // La capa de datos lo lee desde fuera de React para saber dónde
  // guardar cada receta y cada foto. Y se anota cuál queda abierto, para
  // volver a él tras cualquier ida y vuelta.
  useEffect(() => {
    recordarFamilia(familia?.id ?? null)
    if (familia) recordar(familia.id)
  }, [familia])

  const entrar = useCallback(
    (nueva: Familia) => {
      // Se anota antes de recargar, para que la recarga vuelva a este y
      // no al primero de la lista.
      recordar(nueva.id)
      setTodas((previas) =>
        previas.some((f) => f.id === nueva.id) ? previas : [...previas, nueva],
      )
      setFamilia(nueva)

      /**
       * Y se recarga.
       *
       * Las funciones de la base devuelven solo nombre y código al crear
       * o al entrar, no quién lo creó. Y eso es justo lo que decide si
       * sale el botón de borrar: sin recargar, quien acababa de crear un
       * recetario no podía borrar en él hasta refrescar la página.
       */
      recargar()
    },
    [recargar],
  )

  const elegir = useCallback(
    (familiaId: string) => {
      const suya = todas.find((f) => f.id === familiaId)
      if (suya) setFamilia(suya)
    },
    [todas],
  )

  const valor = useMemo<ContextoFamilia>(
    () => ({
      familia,
      // Si no se sabe quién lo creó, se asume que no. Más vale esconder
      // un botón de más que enseñar uno que va a fallar.
      soyDuena: Boolean(
        familia?.creadaPor && usuarioId && familia.creadaPor === usuarioId,
      ),
      todas,
      cargando,
      error,
      entrar,
      elegir,
      recargar,
    }),
    [familia, usuarioId, todas, cargando, error, entrar, elegir, recargar],
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

