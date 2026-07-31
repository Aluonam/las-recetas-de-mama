import { useEffect, useRef } from 'react'
import { useUrlArchivo } from '../archivos/useUrlArchivo'

interface Props {
  /** Ruta del bucket, o una dirección ya utilizable. */
  url: string
  /** Encabezado opcional, para cuando va suelto en la ficha. */
  titulo?: string
  descripcion?: string
}

/**
 * Reproductor nativo del navegador: ya trae controles grandes,
 * accesibles y conocidos. Escribir uno propio sería trabajo para
 * empeorarlo.
 */
export function ReproductorAudio({ url, titulo, descripcion }: Props) {
  const firmada = useUrlArchivo(url)
  const audio = useDuracionCompleta(firmada)

  return (
    <div>
      {titulo && <h2 className="mb-1 text-xl">{titulo}</h2>}
      {descripcion && <p className="mb-3 text-tinta-suave">{descripcion}</p>}

      {firmada ? (
        <audio
          ref={audio}
          controls
          preload="metadata"
          src={firmada}
          className="w-full"
        >
          Tu navegador no puede reproducir este audio.
        </audio>
      ) : (
        <p role="status" className="text-tinta-suave">
          Preparando el audio…
        </p>
      )}
    </div>
  )
}

/**
 * Le saca al navegador la duración de un audio grabado aquí.
 *
 * Lo que graba el micrófono es un WebM de retransmisión: se va
 * escribiendo mientras hablas y por eso su cabecera no dice cuánto dura
 * —cuando se escribe, todavía no se sabe—. El reproductor lee esa
 * cabecera, no encuentra la duración y se queda con que es infinita: la
 * barra no avanza, no se puede mover, y al llegar al final de lo poco
 * que tenía descargado se para. De ahí lo de grabar cinco segundos y oír
 * solo el primero. El audio estaba entero; era el reproductor el que no
 * sabía hasta dónde llegaba.
 *
 * El apaño es el de toda la vida: mandarlo a un punto imposiblemente
 * lejano. Para obedecer tiene que recorrerse el archivo, y al llegar al
 * final ya sabe lo que dura. Entonces se vuelve al principio y queda
 * como cualquier otro audio.
 *
 * Solo hace falta con lo grabado aquí. Una nota de voz de WhatsApp viene
 * con su duración escrita y se salta este camino sola.
 */
function useDuracionCompleta(fuente: string | null) {
  const audio = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const nodo = audio.current
    if (!nodo || !fuente) return

    const alVolver = () => {
      nodo.currentTime = 0
      nodo.removeEventListener('timeupdate', alVolver)
    }

    const alSaberLoQueDura = () => {
      // Si ya trae la duración puesta, no hay nada que hacer.
      if (Number.isFinite(nodo.duration)) return

      nodo.addEventListener('timeupdate', alVolver)
      // Un número absurdo a propósito: cualquier cosa más allá del final
      // sirve, y así no hay que adivinar cuánto puede durar.
      nodo.currentTime = 1e101
    }

    nodo.addEventListener('loadedmetadata', alSaberLoQueDura)
    // Puede haber cargado antes de que lleguemos a escuchar.
    if (nodo.readyState >= 1) alSaberLoQueDura()

    return () => {
      nodo.removeEventListener('loadedmetadata', alSaberLoQueDura)
      nodo.removeEventListener('timeupdate', alVolver)
    }
  }, [fuente])

  return audio
}
