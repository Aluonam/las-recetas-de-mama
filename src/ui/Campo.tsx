import { useId } from 'react'
import type { ReactNode } from 'react'
import { BotonDictar } from './BotonDictar'

interface PropsBase {
  etiqueta: string
  /** Texto de apoyo bajo la etiqueta. Se enlaza con aria-describedby. */
  ayuda?: string
}

/** Envoltorio con etiqueta y ayuda accesibles. El hijo recibe su `id`. */
export function Campo({
  etiqueta,
  ayuda,
  children,
}: PropsBase & { children: (id: string, idAyuda?: string) => ReactNode }) {
  const id = useId()
  const idAyuda = ayuda ? `${id}-ayuda` : undefined

  return (
    <div>
      <label htmlFor={id} className="etiqueta">
        {etiqueta}
      </label>
      {ayuda && (
        <p id={idAyuda} className="mb-1 text-sm text-tinta-suave">
          {ayuda}
        </p>
      )}
      {children(id, idAyuda)}
    </div>
  )
}

type PropsTexto = PropsBase &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'id'>

export function CampoTexto({ etiqueta, ayuda, ...resto }: PropsTexto) {
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda}>
      {(id, idAyuda) => (
        <input id={id} aria-describedby={idAyuda} className="campo" {...resto} />
      )}
    </Campo>
  )
}

type PropsArea = PropsBase &
  Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
    /**
     * Añade el botón de dictar debajo. Solo donde se escribe de
     * corrido: hay quien no escribe la historia de una receta pero la
     * cuenta de viva voz sin pensarlo.
     */
    dictable?: (texto: string) => void
  }

export function CampoArea({
  etiqueta,
  ayuda,
  rows = 4,
  dictable,
  ...resto
}: PropsArea) {
  return (
    <Campo etiqueta={etiqueta} ayuda={ayuda}>
      {(id, idAyuda) => (
        <>
          <textarea
            id={id}
            rows={rows}
            aria-describedby={idAyuda}
            className="campo"
            {...resto}
          />
          {dictable && (
            <BotonDictar
              valor={String(resto.value ?? '')}
              alCambiar={dictable}
              etiqueta={etiqueta.toLowerCase()}
            />
          )}
        </>
      )}
    </Campo>
  )
}
