import { useRef, useState } from 'react'
import { subirAudio } from '../almacenamiento'
import { nuevoId } from '../formato'
import { NOMBRE_APARTADO } from '../tipos'
import type { Apartado, AudioApartado } from '../tipos'
import { Aviso } from '../../ui/Estado'
import { ReproductorAudio } from './ReproductorAudio'
import { SE_PUEDE_GRABAR, reloj, useGrabadora } from './useGrabadora'

/**
 * Las notas de voz de un apartado.
 *
 * La grabación de la receta entera sirve para quien se sienta a
 * contarla de principio a fin. Esto es lo otro: el aviso suelto que se
 * dice justo cuando toca —«las manzanas tienen que quedar rectas por la
 * base, para que se asienten en el plato»— y que escrito no lo escribe
 * nadie porque parece una tontería hasta que la haces sin saberlo.
 *
 * Por eso el botón no dice «grabar audio» sino «decirlo en voz alta», y
 * por eso van varias por apartado: no es una grabación, son las cosas
 * que se van diciendo.
 *
 * La nota de al lado es opcional y corta. Sirve para saber qué hay
 * dentro sin darle al play, que con tres audios seguidos es la
 * diferencia entre usarlos y no.
 */
export function AudiosApartado({
  apartado,
  audios,
  alCambiar,
}: {
  apartado: Apartado
  /** Todos los de la receta: aquí se filtran los que tocan. */
  audios: AudioApartado[]
  alCambiar: (audios: AudioApartado[]) => void
}) {
  const entrada = useRef<HTMLInputElement>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const suyos = audios.filter((audio) => audio.apartado === apartado)

  const añadir = async (archivo: Blob, nombre?: string) => {
    setGuardando(true)
    setError(null)
    try {
      const url = await subirAudio(archivo, nombre)
      alCambiar([...audios, { id: nuevoId(), apartado, url }])
    } catch (e) {
      setError(e)
    } finally {
      setGuardando(false)
    }
  }

  const grabadora = useGrabadora((audio) => añadir(audio))

  const cambiarNota = (id: string, nota: string) =>
    alCambiar(
      audios.map((audio) => (audio.id === id ? { ...audio, nota } : audio)),
    )

  const quitar = (id: string) =>
    alCambiar(audios.filter((audio) => audio.id !== id))

  return (
    <div className="mt-4 rounded-lg border border-dashed border-rosa-medio p-3">
      {suyos.length > 0 && (
        <ul className="m-0 mb-3 list-none space-y-3 p-0">
          {suyos.map((audio, orden) => (
            <li key={audio.id} className="space-y-2">
              <ReproductorAudio url={audio.url} />

              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor={`nota-${audio.id}`} className="sr-only">
                  De qué va esta nota de voz
                </label>
                <input
                  id={`nota-${audio.id}`}
                  className="campo h-9 flex-1 text-sm"
                  placeholder={`Nota ${orden + 1}: de qué va, en tres palabras`}
                  value={audio.nota ?? ''}
                  onChange={(e) => cambiarNota(audio.id, e.target.value)}
                />
                <button
                  type="button"
                  className="boton-secundario h-9 px-3 text-sm"
                  onClick={() => quitar(audio.id)}
                >
                  Quitar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {grabadora.grabando ? (
        <div className="flex flex-wrap items-center gap-2">
          <p
            role="status"
            className="flex items-center gap-2 font-semibold text-rosa-texto"
          >
            <span
              aria-hidden="true"
              className="size-3 animate-pulse rounded-full bg-rosa-medio"
            />
            Grabando… {reloj(grabadora.segundos)}
          </p>
          <button
            type="button"
            className="boton-principal h-9 px-3 text-sm"
            onClick={grabadora.parar}
          >
            Parar y guardar
          </button>
          <button
            type="button"
            className="boton-secundario h-9 px-3 text-sm"
            onClick={grabadora.cancelar}
          >
            Descartar
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          {SE_PUEDE_GRABAR && (
            <button
              type="button"
              className="boton-secundario h-9 px-3 text-sm"
              onClick={grabadora.empezar}
              disabled={guardando}
            >
              <Microfono />
              {suyos.length > 0
                ? 'Decir otra cosa'
                : `Decir algo sobre ${NOMBRE_APARTADO[apartado]}`}
            </button>
          )}

          <label className="boton-secundario h-9 cursor-pointer px-3 text-sm">
            {guardando ? 'Guardando…' : 'Subir un audio'}
            <input
              ref={entrada}
              type="file"
              accept="audio/*"
              className="sr-only"
              disabled={guardando}
              onChange={async (evento) => {
                const archivo = evento.target.files?.[0]
                if (archivo) await añadir(archivo, archivo.name)
                // Permite volver a elegir el mismo archivo si hubo error.
                if (entrada.current) entrada.current.value = ''
              }}
            />
          </label>
        </div>
      )}

      {grabadora.error != null && <Aviso error={grabadora.error} />}
      {error != null && <Aviso error={error} />}
    </div>
  )
}

function Microfono() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      aria-hidden="true"
      className="size-4"
    >
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
    </svg>
  )
}
