import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

/**
 * La pregunta antes de algo que no se puede deshacer.
 *
 * Sustituye al aviso del sistema. Aquel decía «Aceptar» y «Cancelar»
 * —dos palabras que no dicen qué va a pasar—, salía con la letra y los
 * colores del navegador, y en la aplicación instalada aparecía además
 * con el nombre de la web encima, como si avisara de algo grave.
 *
 * Aquí los botones dicen lo que hacen: «Sí, borrar «Croquetas»» y «No».
 * Leer solo el botón basta para saber qué se está aceptando, que es
 * justo lo que hace falta cuando se pregunta con el dedo encima.
 *
 * El foco entra en «No» a propósito. Es lo que se quiere el 90% de las
 * veces que uno se para a leer esta pregunta.
 */
export function Confirmar({
  titulo,
  detalle,
  textoSi,
  textoNo = 'No',
  peligroso = false,
  alSi,
  alNo,
}: {
  titulo: string
  detalle?: ReactNode
  /** Dice lo que va a pasar: «Sí, borrar «Croquetas»». */
  textoSi: string
  textoNo?: string
  /** Pinta el botón de aceptar en rojo: se va a perder algo. */
  peligroso?: boolean
  alSi: () => void
  alNo: () => void
}) {
  const no = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const comoEstaba = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') alNo()
    }
    window.addEventListener('keydown', alTeclear)
    no.current?.focus()

    return () => {
      document.body.style.overflow = comoEstaba
      window.removeEventListener('keydown', alTeclear)
    }
  }, [alNo])

  return createPortal(
    <div
      // Pulsar fuera es lo mismo que decir que no: nunca lleva a hacer
      // algo, solo a dejarlo.
      onClick={alNo}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-tinta/40 p-4"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmar-titulo"
        onClick={(evento) => evento.stopPropagation()}
        className="tarjeta w-full max-w-md p-5 sm:p-6"
      >
        <h2 id="confirmar-titulo" className="mb-2 text-xl">
          {titulo}
        </h2>

        {detalle && <div className="mb-5 text-tinta-suave">{detalle}</div>}

        <div className="flex flex-wrap justify-end gap-2">
          <button
            ref={no}
            type="button"
            className="boton-secundario"
            onClick={alNo}
          >
            {textoNo}
          </button>
          <button
            type="button"
            onClick={alSi}
            className={peligroso ? 'boton-peligro' : 'boton-principal'}
          >
            {textoSi}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
