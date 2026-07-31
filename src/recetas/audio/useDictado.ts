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

    nuevo.onresult = (evento) => {
      let dicho = ''
      for (let i = evento.resultIndex; i < evento.results.length; i++) {
        const resultado = evento.results[i]
        if (resultado.isFinal) dicho += resultado[0].transcript
      }
      if (dicho.trim()) alDictarRef.current(dicho.trim())
    }

    nuevo.onerror = (evento) => {
      setError(
        evento.error === 'not-allowed'
          ? 'No se ha dado permiso para usar el micrófono.'
          : evento.error === 'no-speech'
            ? 'No se ha oído nada. Acércate al micrófono y prueba otra vez.'
            : evento.error === 'network'
              ? 'Hace falta internet para dictar: el reconocimiento no se hace en el aparato.'
              : 'No se ha podido dictar. Prueba otra vez, o escríbelo a mano.',
      )
    }

    nuevo.onend = () => {
      setEscuchando(false)
      motor.current = null
    }

    motor.current = nuevo
    nuevo.start()
    setEscuchando(true)
  }, [])

  // Si esto desaparece mientras escucha, se suelta el micrófono.
  useEffect(() => () => motor.current?.stop(), [])

  return { escuchando, error, empezar, parar }
}
