import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Cuántos bloques caben en cada cara, preguntándoselo al navegador.
 *
 * Se probó a calcularlo: tantos pasos por cara, contando el largo del
 * texto. Falla en cuanto alguien agranda la letra, gira la tablet o abre
 * la web en un portátil más bajo, que es justo lo que va a pasar. Y aquí
 * fallar significa una receta cortada sin avisar, no un hueco feo.
 *
 * Así que se pinta el cuerpo entero en un sitio invisible, con el mismo
 * ancho y la misma letra que la cara de verdad, se pregunta cuánto ocupa
 * cada bloque, y se reparte. No se adivina nada.
 *
 * Se rehace cuando cambia el tamaño de la caja, que es lo que ocurre al
 * girar la tablet o al cambiar el zoom. Por eso vale para todos los
 * casos sin tener un número distinto para cada uno.
 */
export function useReparto(claves: string[]) {
  /** La caja de verdad: de ella sale cuánto sitio hay. */
  const caja = useRef<HTMLDivElement>(null)
  /** La copia invisible: de ella sale cuánto ocupa cada bloque. */
  const medidor = useRef<HTMLDivElement>(null)

  /**
   * Null mientras no se ha medido.
   *
   * Es distinto de «todo en una cara»: hasta que se mide no se sabe
   * cuántas hojas tiene la receta, y navegar con ese dato a medias
   * dejaría pasar de largo lo que todavía no se ha repartido.
   */
  const [caras, setCaras] = useState<string[][] | null>(null)

  const medir = useCallback(() => {
    const dentro = caja.current
    const copia = medidor.current
    if (!dentro || !copia) return

    const alto = dentro.clientHeight
    const trozos = [...copia.children]
    if (alto <= 0 || trozos.length === 0) return

    const repartidas: string[][] = []
    let actual: string[] = []
    let usado = 0

    trozos.forEach((trozo, i) => {
      const suyo = trozo.getBoundingClientRect().height

      /**
       * Se cambia de cara cuando el bloque no cabe, pero nunca se deja
       * una cara vacía: un bloque más alto que la cara entera —un paso
       * larguísimo— se queda solo en la suya y se desplaza por dentro.
       * Es feo, pero es mejor que un hueco en blanco y el bloque
       * empujado a la hoja siguiente igual de cortado.
       */
      if (actual.length > 0 && usado + suyo > alto) {
        repartidas.push(actual)
        actual = []
        usado = 0
      }

      actual.push(claves[i])
      usado += suyo
    })

    if (actual.length > 0) repartidas.push(actual)

    setCaras((antes) => (igual(antes, repartidas) ? antes : repartidas))
  }, [claves])

  // Cuando cambia la receta, lo repartido deja de valer.
  useEffect(() => {
    setCaras(null)
  }, [claves])

  useEffect(() => {
    medir()

    const dentro = caja.current
    if (!dentro) return

    const vigilante = new ResizeObserver(medir)
    vigilante.observe(dentro)
    return () => vigilante.disconnect()
  }, [medir])

  return { caja, medidor, caras }
}

/** Sin esto, cada medida creaba un array nuevo y se repintaba en bucle. */
function igual(a: string[][] | null, b: string[][]): boolean {
  if (!a || a.length !== b.length) return false
  return a.every(
    (cara, i) =>
      cara.length === b[i].length && cara.every((clave, j) => clave === b[i][j]),
  )
}
