import { Link } from 'react-router-dom'
import { BuscadorLupa } from './BuscadorLupa'
import type { Agrupacion } from '../indice/agrupar'
import { COLUMNAS } from '../indice/usePreferenciaVista'
import type { Columnas, Vista } from '../indice/usePreferenciaVista'

/**
 * Los mandos del recetario, en una sola fila.
 *
 * Antes ocupaban tres: las solapas, las píldoras de ocasión y el botón
 * de pantalla completa. Tres renglones de mandos delante de las recetas
 * es mucho pedir para elegir entre dos maneras de mirar.
 *
 * Ahora:
 *
 *   [☰] [Buscar] [Ocasión ▾] ··· [1 2 3 4] [libro] [+ Receta]
 *
 * A la izquierda, lo que decide la forma de lo que hay debajo. A la
 * derecha, lo que se hace con ello. Y separadas, porque no son lo mismo.
 *
 * El libro deja de ser una tercera manera de mirar y pasa a ser un
 * botón: no es una vista más, es abrir el recetario entero y ponerse a
 * hojear, y eso ocurre a pantalla completa.
 *
 * El desplegable cambia según lo que se esté mirando: en tarjetas filtra
 * por ocasión, en lista ordena. Nunca hay dos, y la fila mide siempre lo
 * mismo.
 */
export function BarraRecetario({
  busqueda,
  alBuscar,
  vista,
  alCambiarVista,
  ocasiones,
  ocasion,
  alFiltrar,
  agrupacion,
  alAgrupar,
  columnas,
  alCambiarColumnas,
  alAbrirLibro,
}: {
  busqueda: string
  alBuscar: (texto: string) => void
  vista: Vista
  alCambiarVista: (vista: Vista) => void
  ocasiones: string[]
  ocasion: string | null
  alFiltrar: (ocasion: string | null) => void
  agrupacion: Agrupacion
  alAgrupar: (agrupacion: Agrupacion) => void
  columnas: Columnas
  alCambiarColumnas: (columnas: Columnas) => void
  alAbrirLibro: () => void
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {/**
       * Tarjetas o lista, en un solo botón que alterna.
       *
       * Eran dos, uno al lado del otro, y siempre había uno encendido
       * que no hacía nada: pulsar el que ya estás viendo no lleva a
       * ninguna parte. Con uno solo, el dibujo enseña a dónde vas y
       * pulsarlo siempre cambia algo.
       *
       * Va el primero de la fila porque es lo que decide la forma de
       * todo lo que hay debajo.
       */}
      <button
        type="button"
        onClick={() => alCambiarVista(vista === 'fichas' ? 'indice' : 'fichas')}
        aria-label={
          vista === 'fichas' ? 'Ver en lista' : 'Ver en tarjetas'
        }
        title={vista === 'fichas' ? 'Ver en lista' : 'Ver en tarjetas'}
        className="boton-secundario flex h-9 w-10 items-center justify-center p-0"
      >
        {vista === 'fichas' ? <Renglones /> : <Rejilla />}
      </button>

      <BuscadorLupa busqueda={busqueda} alBuscar={alBuscar} />

      {vista === 'fichas'
        ? ocasiones.length > 0 && (
            <select
              className="campo h-9 w-40 text-sm"
              aria-label="Filtrar por ocasión"
              value={ocasion ?? ''}
              onChange={(evento) => alFiltrar(evento.target.value || null)}
            >
              <option value="">Todas las ocasiones</option>
              {ocasiones.map((una) => (
                <option key={una} value={una}>
                  {una}
                </option>
              ))}
            </select>
          )
        : (
            <select
              className="campo h-9 w-40 text-sm"
              aria-label="Ordenar la lista por"
              value={agrupacion}
              onChange={(evento) =>
                alAgrupar(evento.target.value as Agrupacion)
              }
            >
              <option value="plato">Por plato</option>
              <option value="quien">Por quién la hacía</option>
              <option value="ocasion">Por ocasión</option>
            </select>
          )}

      <div className="flex-1" />

      {/**
       * Cuántas tarjetas por fila, como en las tiendas de ropa.
       *
       * Solo en tarjetas: en la lista no hay columnas que elegir. Las de
       * tres y cuatro se esconden en pantalla estrecha, porque allí no
       * llegan a caber y un botón que no hace lo que dice es peor que no
       * tenerlo.
       */}
      {vista === 'fichas' && (
        <div
          role="group"
          aria-label="Cuántas recetas por fila"
          className="flex overflow-hidden rounded-lg border border-verde-texto"
        >
          {COLUMNAS.map((cuantas) => (
            <button
              key={cuantas}
              type="button"
              onClick={() => alCambiarColumnas(cuantas)}
              aria-pressed={columnas === cuantas}
              aria-label={`Ver ${cuantas} por fila`}
              title={`Ver ${cuantas} por fila`}
              className={
                'flex h-9 w-9 items-center justify-center transition-colors ' +
                (cuantas > 2 ? 'hidden md:flex ' : '') +
                (columnas === cuantas
                  ? 'bg-verde-texto text-papel'
                  : 'bg-superficie text-verde-texto hover:bg-superficie-2')
              }
            >
              <Barras cuantas={cuantas} />
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={alAbrirLibro}
        aria-label="Abrir el libro"
        title="Abrir el libro"
        className="boton-secundario h-9 px-3"
      >
        <Libro />
      </button>

      {/**
       * Escribir una receta, en esta fila y más grande que el resto.
       *
       * Estaba arriba, en la esquina, compitiendo con el título de la
       * página. Aquí está con lo demás que se toca, y siendo lo único
       * que crea algo, es lo único que va más alto y en verde lleno: en
       * una fila de mandos del mismo tamaño no se distinguiría de mirar
       * las recetas de otra manera.
       */}
      <Link
        to="/nueva"
        aria-label="Escribir una receta"
        title="Escribir una receta"
        className="boton-principal h-11 gap-1 px-4 no-underline"
      >
        <span aria-hidden="true" className="text-2xl leading-none">
          +
        </span>
        <span className="hidden sm:inline">Receta</span>
      </Link>
    </div>
  )
}

/**
 * Tantas barras como columnas, que es como se dibuja esto en las
 * tiendas: se entiende sin leer nada.
 */
function Barras({ cuantas }: { cuantas: number }) {
  const hueco = 2
  const ancho = (18 - hueco * (cuantas - 1)) / cuantas

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
      {Array.from({ length: cuantas }, (_, n) => (
        <rect
          key={n}
          x={3 + n * (ancho + hueco)}
          y={4}
          width={ancho}
          height={16}
          rx={Math.min(1.5, ancho / 2)}
        />
      ))}
    </svg>
  )
}

function Rejilla() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="size-4">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  )
}

function Renglones() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
      className="size-4"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

/** Un libro abierto, visto de frente. */
function Libro() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5"
    >
      <path d="M12 6.5C10.4 5 8.3 4.3 4.5 4.3v13c3.8 0 5.9.7 7.5 2.2 1.6-1.5 3.7-2.2 7.5-2.2v-13c-3.8 0-5.9.7-7.5 2.2Z" />
      <path d="M12 6.5v13" />
    </svg>
  )
}
