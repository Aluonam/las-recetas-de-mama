import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Grabación de voz con el micrófono, encapsulada.
 *
 * El componente que la usa no toca MediaRecorder ni gestiona permisos:
 * recibe el audio ya terminado por `alTerminar`.
 */

/** Del mejor al peor. Safari solo entiende mp4; el resto prefieren opus. */
const FORMATOS = [
  'audio/webm;codecs=opus',
  'audio/ogg;codecs=opus',
  'audio/webm',
  'audio/mp4',
]

function mejorFormato(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  return FORMATOS.find((formato) => MediaRecorder.isTypeSupported(formato))
}

/** ¿Puede este navegador grabar? Si no, se ofrece solo subir archivo. */
export const SE_PUEDE_GRABAR =
  typeof navigator !== 'undefined' &&
  Boolean(navigator.mediaDevices?.getUserMedia) &&
  typeof MediaRecorder !== 'undefined'

export function useGrabadora(alTerminar: (audio: Blob) => void) {
  const [grabando, setGrabando] = useState(false)
  const [segundos, setSegundos] = useState(0)
  const [error, setError] = useState<unknown>(null)

  const grabadora = useRef<MediaRecorder | null>(null)
  const trozos = useRef<Blob[]>([])
  const reloj = useRef<number | null>(null)
  const descartar = useRef(false)

  // En una ref para que `parar` no dependa de la última versión de la
  // función y no haya que recrear los manejadores en cada render.
  const alTerminarRef = useRef(alTerminar)
  alTerminarRef.current = alTerminar

  const soltarMicrofono = useCallback(() => {
    grabadora.current?.stream.getTracks().forEach((pista) => pista.stop())
    grabadora.current = null

    if (reloj.current !== null) {
      clearInterval(reloj.current)
      reloj.current = null
    }
  }, [])

  const empezar = useCallback(async () => {
    setError(null)
    descartar.current = false

    try {
      const formato = mejorFormato()
      const pista = await navigator.mediaDevices.getUserMedia({ audio: true })
      const nueva = new MediaRecorder(
        pista,
        formato ? { mimeType: formato } : undefined,
      )

      trozos.current = []
      nueva.ondataavailable = (evento) => {
        if (evento.data.size > 0) trozos.current.push(evento.data)
      }

      nueva.onerror = () => {
        setError(
          new Error(
            'El micrófono ha dejado de grabar a media grabación. Vuelve a ' +
              'intentarlo, y si sigue pasando prueba a subir una nota de voz.',
          ),
        )
      }

      nueva.onstop = () => {
        const audio = new Blob(trozos.current, {
          type: nueva.mimeType || 'audio/webm',
        })
        soltarMicrofono()
        setGrabando(false)

        if (descartar.current) return

        /**
         * Una grabación vacía no puede pasar en silencio.
         *
         * Antes, si no había datos, no se guardaba nada y tampoco se
         * decía nada: pulsabas «Parar y guardar» y la pantalla volvía al
         * principio como si no hubiera ocurrido. Pasa cuando el
         * micrófono está mudo, o cuando se para tan rápido que no da
         * tiempo a un solo trozo.
         */
        if (audio.size === 0) {
          setError(
            new Error(
              'No se ha grabado nada. Comprueba que el micrófono está ' +
                'conectado y que no está silenciado, y habla un par de ' +
                'segundos antes de parar.',
            ),
          )
          return
        }

        alTerminarRef.current(audio)
      }

      grabadora.current = nueva

      /**
       * Un trozo por segundo, en vez de uno solo al final.
       *
       * Sin este número, el navegador guarda toda la grabación en un
       * único bloque que solo entrega al parar, y si algo se tuerce por
       * el camino —la pestaña pasa a segundo plano, el micrófono se
       * reengancha, el sistema pide memoria— se pierde entera. Pidiendo
       * trozos, lo grabado hasta ese momento ya está a salvo.
       */
      nueva.start(1000)
      setGrabando(true)
      setSegundos(0)
      reloj.current = window.setInterval(
        () => setSegundos((previos) => previos + 1),
        1000,
      )
    } catch (e) {
      // Lo habitual aquí es que se haya denegado el permiso del micrófono.
      setError(
        e instanceof DOMException && e.name === 'NotAllowedError'
          ? new Error(
              'No se ha dado permiso para usar el micrófono. Actívalo en los ' +
                'ajustes del navegador y vuelve a intentarlo.',
            )
          : e,
      )
    }
  }, [soltarMicrofono])

  const parar = useCallback(() => {
    grabadora.current?.stop()
  }, [])

  const cancelar = useCallback(() => {
    descartar.current = true
    grabadora.current?.stop()
  }, [])

  /**
   * Si esto desaparece a media grabación, se para bien.
   *
   * Antes solo se soltaba el micrófono, y el grabador se quedaba sin
   * parar: nunca llegaba a montar el archivo, así que lo grabado se
   * perdía sin más. Pararlo dispara el mismo camino de siempre —montar
   * el audio y guardarlo—, y eso salva la grabación de quien se cambia
   * de paso en mitad de una frase.
   */
  useEffect(
    () => () => {
      const activa = grabadora.current
      if (activa && activa.state !== 'inactive') activa.stop()
      else soltarMicrofono()
    },
    [soltarMicrofono],
  )

  return { grabando, segundos, error, empezar, parar, cancelar }
}

/** 0:07, 1:42, 12:05 */
export function reloj(segundos: number): string {
  const minutos = Math.floor(segundos / 60)
  const resto = segundos % 60
  return `${minutos}:${String(resto).padStart(2, '0')}`
}
