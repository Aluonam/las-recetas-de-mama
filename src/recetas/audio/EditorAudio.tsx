import { useRef, useState } from 'react'
import { subirAudio } from '../almacenamiento'
import { Aviso } from '../../ui/Estado'
import { ReproductorAudio } from './ReproductorAudio'
import { SE_PUEDE_GRABAR, reloj, useGrabadora } from './useGrabadora'

interface Props {
  url?: string | null
  alGuardar: (url: string) => void
  alQuitar: () => void
  /** Sin la explicación de debajo: para cuando va repetido, paso a paso. */
  compacto?: boolean
}

/**
 * La voz de quien cuenta la receta.
 *
 * Dos caminos a propósito:
 * - **Grabar** con el micrófono, para quien está y puede contarla ahora.
 * - **Subir** un audio que ya existe, normalmente una nota de voz de
 *   WhatsApp. Es el caso importante: a veces quien la contaba ya no está y
 *   ese archivo es lo único que queda.
 */
export function EditorAudio({ url, alGuardar, alQuitar, compacto = false }: Props) {
  const entrada = useRef<HTMLInputElement>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const guardar = async (audio: Blob, nombre?: string) => {
    setGuardando(true)
    setError(null)
    try {
      alGuardar(await subirAudio(audio, nombre))
    } catch (e) {
      setError(e)
    } finally {
      setGuardando(false)
    }
  }

  const grabadora = useGrabadora((audio) => guardar(audio))

  const elegirArchivo = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    if (archivo) await guardar(archivo, archivo.name)
    // Permite volver a elegir el mismo archivo si hubo error.
    if (entrada.current) entrada.current.value = ''
  }

  if (url) {
    return (
      <div className="space-y-3">
        <ReproductorAudio url={url} />
        <button type="button" className="boton-secundario" onClick={alQuitar}>
          Quitar el audio
        </button>
      </div>
    )
  }

  if (grabadora.grabando) {
    return (
      <div className="space-y-3">
        <p role="status" className="flex items-center gap-3 text-lg font-semibold">
          <span
            aria-hidden="true"
            className="size-3 animate-pulse rounded-full bg-acento"
          />
          Grabando… {reloj(grabadora.segundos)}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="boton-principal flex-1 sm:flex-none"
            onClick={grabadora.parar}
          >
            Parar y guardar
          </button>
          <button
            type="button"
            className="boton-secundario"
            onClick={grabadora.cancelar}
          >
            Descartar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {SE_PUEDE_GRABAR && (
          <button
            type="button"
            className="boton-principal flex-1 sm:flex-none"
            onClick={grabadora.empezar}
            disabled={guardando}
          >
            Grabar ahora
          </button>
        )}

        <label className="boton-secundario flex-1 cursor-pointer sm:flex-none">
          {guardando ? 'Guardando…' : 'Subir un audio que ya tengas'}
          <input
            ref={entrada}
            type="file"
            accept="audio/*"
            className="sr-only"
            disabled={guardando}
            onChange={elegirArchivo}
          />
        </label>
      </div>

      {/* La explicación estorba donde esto va repetido, un paso detrás de
          otro: allí ya se sabe de qué va y solo hacen falta los botones. */}
      {!compacto && (
        <p className="text-sm text-tinta-suave">
          Si tienes una nota de voz de WhatsApp contando la receta, súbela aquí.
          {!SE_PUEDE_GRABAR && ' Este navegador no permite grabar directamente.'}
        </p>
      )}

      {grabadora.error != null && <Aviso error={grabadora.error} />}
      {error != null && <Aviso error={error} />}
    </div>
  )
}
