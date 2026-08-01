import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hablar y que se escriba solo.
 *
 * Mucha gente no escribe la historia de una receta —les da pereza, o el
 * teclado de la tablet, o no se ven contándolo por escrito—, pero la
 * cuentan de viva voz sin pensarlo. Esto es para eso: se pulsa, se
 * habla, y las palabras caen en el campo.
 *
 * Lo hace el propio navegador, sin servidor ni clave de nadie. Va en
 * Chrome, Edge, Safari y el navegador de Android, que es donde va a
 * estar la tablet; en los que no, el botón no aparece y se escribe a
 * mano como siempre. Necesita internet, porque el reconocimiento lo hace
 * el fabricante del navegador, no el aparato.
 *
 * Ojo: esto NO es la grabadora. Aquí no se guarda ningún audio, solo
 * texto. La voz de la abuela, la de verdad, se guarda en «Su voz», que
 * es otra cosa y no se sustituye con esto.
 */

/**
 * Los tipos, escritos aquí.
 *
 * TypeScript todavía no trae los del reconocimiento de voz —lleva años
 * en los navegadores pero no en el estándar—, así que se declara lo que
 * se usa y nada más. Escribir la interfaz entera sería copiar una
 * especificación para no usarla.
 */
interface ResultadoDictado {
  readonly isFinal: boolean
  readonly 0: { readonly transcript: string }
}

interface EventoDictado {
  readonly resultIndex: number
  readonly results: {
    readonly length: number
    readonly [posicion: number]: ResultadoDictado
  }
}

interface MotorDictado {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((evento: EventoDictado) => void) | null
  onerror: ((evento: { readonly error: string }) => void) | null
  onstart: (() => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

/** El nombre estándar y el que usa Safari, que va por su cuenta. */
function fabrica(): (new () => MotorDictado) | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as unknown as Record<string, unknown>
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as
    | (new () => MotorDictado)
    | undefined
}

export const SE_PUEDE_DICTAR = Boolean(fabrica())

/** Lo que hay detrás de cada nombre de fallo, en cristiano. */
function mensaje(fallo: string): string {
  if (fallo === 'not-allowed' || fallo === 'service-not-allowed') {
    return (
      'El navegador no ha dejado usar el micrófono. Busca el candado de ' +
      'la barra de direcciones y permítelo para esta página.'
    )
  }

  if (fallo === 'no-speech') {
    return 'No se ha oído nada. Habla un poco más alto y vuelve a pulsar.'
  }

  if (fallo === 'audio-capture') {
    return (
      'No se encuentra ningún micrófono. Comprueba que está conectado y ' +
      'que no lo está usando otro programa.'
    )
  }

  if (fallo === 'network') {
    return (
      'Hace falta internet para dictar: quien entiende lo que dices no es ' +
      'el aparato, es el navegador por su cuenta.'
    )
  }

  // Se para a propósito, o se pulsa otra vez. No hay nada que contar.
  if (fallo === 'aborted') return ''

  // El nombre del fallo va delante: es feo, pero es lo único que
  // permite averiguar qué pasa cuando pasa algo que no está previsto.
  return `El navegador ha cortado el dictado (${fallo}). Vuelve a pulsar.`
}

export function useDictado(alDictar: (texto: string) => void) {
  const [escuchando, setEscuchando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const motor = useRef<MotorDictado | null>(null)

  // En una ref para que arrancar no dependa de la última versión de la
  // función y no haya que recrearlo todo en cada render.
  const alDictarRef = useRef(alDictar)
  alDictarRef.current = alDictar

  const parar = useCallback(() => {
    motor.current?.stop()
  }, [])

  const empezar = useCallback(() => {
    const Motor = fabrica()
    if (!Motor) return

    setError(null)
    const nuevo = new Motor()
    nuevo.lang = 'es-ES'
    // Sigue escuchando entre frase y frase: contar una receta lleva sus
    // pausas, y cortar en el primer silencio obligaría a volver a
    // pulsar cada dos por tres.
    nuevo.continuous = true
    nuevo.interimResults = false

    /**
     * Lo que hay que saber cuando esto se apaga, para saber por qué.
     *
     * `huboFallo` es el importante: si el navegador ya ha dicho lo que
     * pasaba, ese mensaje manda. Antes se guardaba y acto seguido lo
     * machacaba el de «no se ha entendido nada», así que el motivo de
     * verdad no llegaba a verse nunca.
     */
    let algoDicho = false
    let huboFallo = false
    let arranco = false
    const desde = Date.now()

    nuevo.onresult = (evento) => {
      let dicho = ''
      for (let i = evento.resultIndex; i < evento.results.length; i++) {
        const resultado = evento.results[i]
        if (resultado.isFinal) dicho += resultado[0].transcript
      }
      if (!dicho.trim()) return
      algoDicho = true
      alDictarRef.current(dicho.trim())
    }

    nuevo.onerror = (evento) => {
      huboFallo = true
      setError(mensaje(evento.error))
    }

    /**
     * Se apaga solo, y hay que enterarse.
     *
     * El reconocimiento se corta por su cuenta tras un rato de silencio,
     * aunque se le pida que siga. Antes eso solo apagaba el botón sin
     * decir nada: pulsabas, hablabas bajito, y el botón volvía a su sitio
     * como si no hubieras hecho nada. Parecía roto y no lo estaba.
     */
    nuevo.onend = () => {
      setEscuchando(false)
      motor.current = null

      // Si el navegador ya ha dicho qué pasaba, manda su mensaje.
      if (huboFallo || algoDicho) return

      /**
       * Apagarse al momento no es silencio, es que no ha llegado a
       * escuchar. Casi siempre es el permiso del micrófono, que en
       * algunos navegadores se deniega sin dar ningún aviso.
       */
      if (!arranco || Date.now() - desde < 700) {
        setError(
          'El navegador ha cortado el dictado nada más empezar. Suele ser ' +
            'el permiso del micrófono: búscalo en el candado de la barra de ' +
            'direcciones y déjalo puesto para esta página.',
        )
        return
      }

      setError('No se ha oído nada. Habla un poco más alto y vuelve a pulsar.')
    }

    /**
     * Se enciende cuando el navegador dice que está escuchando, no
     * cuando se le pide.
     *
     * Entre pedirlo y estarlo hay un permiso de micrófono de por medio,
     * que puede tardar o no llegar nunca. Encenderlo antes ponía
     * «Escuchando…» sobre un micrófono que estaba apagado.
     */
    nuevo.onstart = () => {
      arranco = true
      setEscuchando(true)
    }

    motor.current = nuevo

    try {
      nuevo.start()
    } catch {
      // Pasa si se pulsa dos veces seguidas: el anterior no ha soltado
      // el micrófono todavía. No es un fallo, es prisa.
      motor.current = null
      setError('Espera un momento y vuelve a intentarlo.')
    }
  }, [])

  // Si esto desaparece mientras escucha, se suelta el micrófono.
  useEffect(() => () => motor.current?.stop(), [])

  return { escuchando, error, empezar, parar }
}
