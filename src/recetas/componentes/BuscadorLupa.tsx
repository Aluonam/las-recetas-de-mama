/**
 * El buscador, en una caja estrecha con la lupa dentro.
 *
 * Estuvo escondido detrás de un botón y no compensaba: abrirlo y
 * cerrarlo movía las solapas de sitio, y un buscador que hay que sacar
 * es un buscador que nadie usa. Ahora está siempre, pero pequeño.
 *
 * El ancho es corto a propósito. Los nombres de plato son cortos —
 * «torrijas», «croquetas»— y una caja que ocupara más que las solapas
 * enteras diría que buscar es lo principal, cuando lo principal es
 * elegir cómo mirar el recetario.
 *
 * La cruz solo sale cuando hay algo escrito, así que no ocupa sitio el
 * resto del tiempo. Escape hace lo mismo.
 */
export function BuscadorLupa({
  busqueda,
  alBuscar,
}: {
  busqueda: string
  alBuscar: (texto: string) => void
}) {
  return (
    <div className="relative">
      <label htmlFor="buscar" className="sr-only">
        Buscar receta
      </label>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-tinta-suave"
      >
        <Lupa />
      </span>

      <input
        id="buscar"
        type="search"
        /**
         * Del alto y la letra de una solapa.
         *
         * La medida de los botones grandes venía de los campos que se
         * rellenan con el dedo, y aquí queda enorme al lado de Fichas,
         * Libro e Índice: esto no es un formulario, es un mando más de
         * la misma fila y tiene que medir lo que miden sus compañeros.
         */
        className="campo h-9 w-36 pl-8 pr-8 text-sm"
        placeholder="Buscar…"
        value={busqueda}
        onChange={(evento) => alBuscar(evento.target.value)}
        onKeyDown={(evento) => {
          if (evento.key === 'Escape') alBuscar('')
        }}
      />

      {busqueda && (
        <button
          type="button"
          onClick={() => alBuscar('')}
          aria-label="Borrar la búsqueda"
          title="Borrar la búsqueda"
          className="absolute right-0.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-tinta-suave transition-colors hover:bg-superficie-2 hover:text-tinta"
        >
          <Aspa />
        </button>
      )}
    </div>
  )
}

function Lupa() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      aria-hidden="true"
      className="size-3.5"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.4 15.4 4.6 4.6" />
    </svg>
  )
}

function Aspa() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
      className="size-3.5"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
