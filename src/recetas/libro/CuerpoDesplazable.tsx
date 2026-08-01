import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * El cuerpo de una cara, con aviso de que sigue abajo.
 *
 * Una receta de veinte pasos no cabe en una cara, y el papel no avisa:
 * el texto se acaba al llegar al canto y parece que la receta se acaba
 * ahí. Quien no sepa que se puede desplazar se queda sin quince pasos y
 * sin enterarse, que es la peor manera de fallar.
 *
 * Así que cuando queda algo por debajo se dice de dos maneras a la vez:
 * el papel se difumina en el borde —eso lo entiende cualquiera sin
 * pensarlo— y encima va una flecha que se puede pulsar, para quien
 * necesite que se lo digan con todas las letras.
 *
 * Se avisa arriba también. Con la receta a medias, la mitad de arriba
 * hay que poder recuperarla, y saber que la hay.
 */
export function CuerpoDesplazable({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  const caja = useRef<HTMLDivElement>(null)
  const [hayArriba, setHayArriba] = useState(false)
  const [hayAbajo, setHayAbajo] = useState(false)

  const mirar = useCallback(() => {
    const dentro = caja.current
    if (!dentro) return

    const arriba = dentro.scrollTop
    const sobra = dentro.scrollHeight - dentro.clientHeight

    // Un par de puntos de margen: los navegadores no siempre cuadran al
    // punto y sin esto la flecha parpadea al llegar al final.
    setHayArriba(arriba > 2)
    setHayAbajo(sobra - arriba > 2)
  }, [])

  useEffect(() => {
    mirar()

    const dentro = caja.current
    if (!dentro) return

    // Cambia al girar la tablet, al cambiar el zoom y al llegar una foto
    // que empuja lo de abajo. Con mirar solo al principio, la flecha se
    // quedaba puesta o quitada de por vida.
    const vigilante = new ResizeObserver(mirar)
    vigilante.observe(dentro)
    for (const hijo of dentro.children) vigilante.observe(hijo)

    return () => vigilante.disconnect()
  }, [mirar, children])

  const bajar = () => {
    const dentro = caja.current
    if (!dentro) return
    dentro.scrollBy({ top: dentro.clientHeight * 0.85, behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={caja}
        onScroll={mirar}
        className={'cuerpo-hoja h-full overflow-y-auto pr-2 ' + className}
      >
        {children}
      </div>

      {hayArriba && <Velo arriba />}

      {hayAbajo && (
        <>
          <Velo />
          <button
            type="button"
            onClick={bajar}
            aria-label="Ver el resto de la página"
            title="Sigue abajo"
            className="absolute bottom-1 left-1/2 flex size-9 -translate-x-1/2 items-center justify-center rounded-full border border-rosa-medio bg-superficie text-rosa-texto shadow-md transition-colors hover:bg-superficie-2"
          >
            <Flecha />
          </button>
        </>
      )}
    </div>
  )
}

/** El papel se desvanece por donde sigue habiendo texto. */
function Velo({ arriba = false }: { arriba?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={
        'pointer-events-none absolute inset-x-0 h-10 ' +
        (arriba ? 'velo-arriba top-0' : 'velo-abajo bottom-0')
      }
    />
  )
}

function Flecha() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
