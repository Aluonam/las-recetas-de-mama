import { useId } from 'react'

/**
 * Una lista que se escribe de una tirada, una cosa por línea.
 *
 * Sustituye a las filas con botón de «Añadir»: para meter doce
 * ingredientes había que pulsar doce veces y saltar entre cinco
 * casillas cada vez. Aquí se escribe seguido, como en un papel, y se
 * cuentan solas las líneas.
 *
 * El cuadro crece con lo que llevas escrito y nunca encoge por debajo de
 * lo que se pidió: ver el hueco pequeño invita a poner tres cosas, y ver
 * sitio invita a seguir.
 */
export function ListaEnTexto({
  etiqueta,
  ayuda,
  placeholder,
  valor,
  alCambiar,
  minimo = 5,
  destacado = false,
}: {
  etiqueta: string
  ayuda?: string
  placeholder?: string
  valor: string
  alCambiar: (texto: string) => void
  /** Líneas visibles como mínimo. */
  minimo?: number
  /** Marco de aviso, para lo que no se debe dejar en blanco. */
  destacado?: boolean
}) {
  const id = useId()
  const idAyuda = ayuda ? `${id}-ayuda` : undefined
  const escritas = valor.split('\n').length

  return (
    <fieldset
      className={
        'm-0 p-4 sm:p-5 ' +
        (destacado
          ? 'rounded-lg border-2 border-rosa-medio bg-superficie'
          : 'tarjeta')
      }
    >
      <legend
        className={
          'px-2 font-titulo text-xl font-semibold ' +
          (destacado ? 'text-rosa-texto' : '')
        }
      >
        {etiqueta}
      </legend>

      {ayuda && (
        <p id={idAyuda} className="mb-3 text-sm text-tinta-suave">
          {ayuda}
        </p>
      )}

      <label htmlFor={id} className="sr-only">
        {etiqueta}, uno por línea
      </label>
      <textarea
        id={id}
        aria-describedby={idAyuda}
        className="campo"
        rows={Math.max(minimo, escritas + 1)}
        placeholder={placeholder}
        value={valor}
        onChange={(evento) => alCambiar(evento.target.value)}
      />
    </fieldset>
  )
}
