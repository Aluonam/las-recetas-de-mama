import { useId, useState } from 'react'
import { BotonDictar } from './BotonDictar'

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
 *
 * MIENTRAS SE ESCRIBE, MANDA EL CUADRO
 *
 * Lo escrito se guarda aquí y solo sale hacia fuera. Al principio no:
 * el texto se sacaba de la lista ya interpretada, así que cada tecla
 * hacía el viaje entero —texto a lista y lista a texto— y en ese viaje
 * se recortan los espacios del final y se tiran las líneas en blanco.
 * Resultado: pulsabas espacio o Enter y desaparecían al momento, porque
 * eran justo lo que la ida y vuelta limpiaba.
 *
 * Que quien escribe pueda dejar una línea a medias, o dos vacías para
 * separar, no es un capricho: es lo que hace que un cuadro de texto se
 * comporte como un cuadro de texto.
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
  /** Lo que había guardado. Solo se lee al abrir. */
  valor: string
  alCambiar: (texto: string) => void
  /** Líneas visibles como mínimo. */
  minimo?: number
  /** Marco de aviso, para lo que no se debe dejar en blanco. */
  destacado?: boolean
}) {
  const id = useId()
  const idAyuda = ayuda ? `${id}-ayuda` : undefined

  // Se parte de lo guardado y a partir de ahí manda esto. La receta ya
  // está cargada cuando esto aparece, así que no hay nada que esperar.
  const [texto, setTexto] = useState(valor)
  const escritas = texto.split('\n').length

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
        value={texto}
        onChange={(evento) => {
          setTexto(evento.target.value)
          alCambiar(evento.target.value)
        }}
      />

      {/* Cada trozo dictado empieza una línea nueva: aquí una línea es
          una cosa —un cacharro, un truco—, y empalmarlos en la misma
          los convertiría en uno solo. */}
      <BotonDictar
        valor={texto}
        etiqueta={etiqueta.toLowerCase()}
        enLineaAparte
        alCambiar={(nuevo) => {
          setTexto(nuevo)
          alCambiar(nuevo)
        }}
      />
    </fieldset>
  )
}
