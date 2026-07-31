import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { RecetaResumen } from '../tipos'
import { PanelLibro } from './PanelLibro'

/**
 * El libro solo, ocupando la pantalla entera.
 *
 * Antes esto se hacía colocando la página para que el libro quedara
 * arriba del todo, pero seguía siendo una página: se veía el borde del
 * papel de la web, el pie asomaba si el libro era corto y en una tablet
 * no acababa de ser «solo libro». Aquí se tapa todo lo demás.
 *
 * Sale con la X de la esquina o con Escape. Las flechas siguen pasando
 * hoja, porque de eso ya se encarga el propio libro.
 *
 * Mientras está abierto se bloquea el desplazamiento de detrás: sin eso,
 * arrastrar en el libro movía la página de debajo y al cerrar aparecías
 * en otro sitio.
 *
 * Se cuelga del `body` y no de donde se escribe. Un `position: fixed`
 * deja de medirse contra la pantalla en cuanto cualquier padre, por
 * arriba que esté, tiene un `transform`, un `filter` o una
 * `perspective` —y este libro usa las tres para girar la hoja—. Colgando
 * de la raíz no hay padre que valga: siempre es la pantalla.
 */
export function LibroPantallaCompleta({
  recetas,
  todas,
  alCerrar,
}: {
  recetas: RecetaResumen[]
  todas: RecetaResumen[]
  alCerrar: () => void
}) {
  const salida = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const comoEstaba = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') alCerrar()
    }
    window.addEventListener('keydown', alTeclear)

    // El foco entra en la salida: quien navega con teclado tiene que
    // poder salir sin recorrerse el índice entero.
    salida.current?.focus()

    return () => {
      document.body.style.overflow = comoEstaba
      window.removeEventListener('keydown', alTeclear)
    }
  }, [alCerrar])

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="El recetario a pantalla completa"
      className="pantalla-libro fixed inset-0 z-50 flex flex-col p-3 sm:p-5"
    >
      <button
        ref={salida}
        type="button"
        onClick={alCerrar}
        aria-label="Salir de pantalla completa"
        title="Salir de pantalla completa (Esc)"
        // 48px de lado, por encima de todo y con sombra: es la única
        // salida que hay, así que tiene que verse antes que nada.
        className="absolute right-3 top-3 z-20 flex size-12 items-center justify-center rounded-full border-2 border-verde-texto bg-superficie text-verde-texto shadow-lg transition-colors hover:bg-superficie-2 sm:right-5 sm:top-5"
      >
        <Aspa />
      </button>

      <div className="min-h-0 flex-1">
        <PanelLibro recetas={recetas} todas={todas} lleno />
      </div>
    </div>,
    document.body,
  )
}

function Aspa() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
      className="size-6"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
