import type { ReactNode, RefObject } from 'react'
import type { Bloque } from './bloquesDelCuerpo'

/**
 * Una cara con un trozo del cuerpo de la receta.
 *
 * Puede ser la primera —la de «Cómo se hace»— o una de las que siguen,
 * que llevan «sigue» para que se sepa que no es otra receta.
 *
 * La primera es además la que mide: lleva dentro una copia invisible del
 * cuerpo entero, con el mismo ancho y la misma letra, de la que se saca
 * cuánto ocupa cada bloque. Va aquí y no en un rincón de la pantalla
 * porque medir en otro sitio es medir otra cosa.
 */
export function CaraCuerpo({
  titulo,
  lado,
  bloques,
  numero,
  caja,
  medidor,
  paraMedir,
}: {
  titulo: string
  lado: 'izquierda' | 'derecha'
  bloques: Bloque[]
  numero: number
  /** La caja real, de la que sale cuánto sitio hay. */
  caja?: RefObject<HTMLDivElement | null>
  /** La copia invisible, de la que sale cuánto ocupa cada bloque. */
  medidor?: RefObject<HTMLDivElement | null>
  /** El cuerpo entero, solo en la cara que mide. */
  paraMedir?: Bloque[]
}) {
  const izquierda = lado === 'izquierda'

  return (
    <article
      className={
        'hoja relative flex h-full flex-col p-6 pb-14 sm:p-8 sm:pb-16 ' +
        (izquierda ? 'hoja-izq pl-14 sm:pl-16' : 'hoja-der')
      }
    >
      <p className="versalitas mb-1 text-center text-rosa-texto">{titulo}</p>
      <div className="guirnalda mb-4" aria-hidden="true" />

      <div ref={caja} className="cuerpo-hoja relative min-h-0 flex-1">
        <div className="space-y-4">
          {bloques.map((bloque) => (
            <div key={bloque.clave}>{bloque.nodo}</div>
          ))}
        </div>

        {/**
         * La copia que se mide.
         *
         * `visibility: hidden` y no `display: none`: lo que no se pinta
         * no tiene alto, y aquí el alto es justo lo que se viene a
         * buscar. Sale del flujo para no empujar a lo de al lado, y no
         * lo lee nadie —ni con los ojos ni con un lector de pantalla—.
         */}
        {paraMedir && (
          <div
            ref={medidor}
            aria-hidden="true"
            className="pointer-events-none invisible absolute inset-x-0 top-0 space-y-4"
          >
            {paraMedir.map((bloque) => (
              <div key={bloque.clave}>{bloque.nodo}</div>
            ))}
          </div>
        )}
      </div>

      <NumeroDePagina numero={numero} izquierda={izquierda} />
    </article>
  )
}

/** Una cara en blanco, cuando el cuerpo acaba en la izquierda del pliego. */
export function CaraEnBlanco({ numero }: { numero: number }) {
  return (
    <article className="hoja hoja-der relative flex h-full flex-col p-6 pb-14 sm:p-8 sm:pb-16">
      <div className="flex h-full items-center justify-center">
        <div className="guirnalda w-2/3 opacity-60" aria-hidden="true" />
      </div>
      <NumeroDePagina numero={numero} izquierda={false} />
    </article>
  )
}

function NumeroDePagina({
  numero,
  izquierda,
}: {
  numero: number
  izquierda: boolean
}): ReactNode {
  return (
    <p
      aria-hidden="true"
      className={
        'absolute bottom-5 font-titulo text-sm text-tinta-suave ' +
        (izquierda ? 'left-14 sm:left-16' : 'right-6 sm:right-8')
      }
    >
      {numero}
    </p>
  )
}
