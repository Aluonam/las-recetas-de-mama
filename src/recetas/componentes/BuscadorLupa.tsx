import { useState } from 'react'

/**
 * El buscador, guardado detrás de una lupa.
 *
 * Ocupaba una barra entera arriba del recetario, y se usa poco: con
 * veinte recetas se busca con los ojos. Lo que sí se usa a diario son
 * las solapas de Fichas, Libro e Índice, así que ellas se quedan a la
 * vista y el buscador espera a que lo llamen.
 *
 * Al cerrarlo se borra lo escrito a propósito. Un filtro puesto que no
 * se ve es la mejor manera de que alguien crea que le faltan recetas.
 */
export function BuscadorLupa({
  busqueda,
  alBuscar,
}: {
  busqueda: string
  alBuscar: (texto: string) => void
}) {
  const [abierto, setAbierto] = useState(false)

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label="Buscar receta"
        title="Buscar receta"
        aria-expanded="false"
        // 44px de lado: el mínimo para acertar con el dedo.
        className="boton-secundario flex size-11 shrink-0 items-center justify-center p-0"
      >
        <Lupa />
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="buscar" className="sr-only">
        Buscar receta
      </label>
      {/* Ancho fijo y corto. Estirándose se comía la fila entera y
          empujaba las solapas al renglón de abajo cada vez que se abría;
          además, para buscar «torrijas» no hace falta media pantalla. */}
      <input
        id="buscar"
        type="search"
        autoFocus
        // Los 44px de los botones, clavados: si el campo midiera un poco
        // más, abrir la búsqueda bajaría las solapas tres píxeles.
        className="campo h-11 w-52"
        placeholder="Buscar receta…"
        value={busqueda}
        onChange={(evento) => alBuscar(evento.target.value)}
        onKeyDown={(evento) => {
          if (evento.key !== 'Escape') return
          alBuscar('')
          setAbierto(false)
        }}
      />
      <button
        type="button"
        onClick={() => {
          alBuscar('')
          setAbierto(false)
        }}
        aria-label="Cerrar la búsqueda"
        title="Cerrar la búsqueda"
        className="boton-secundario flex size-11 shrink-0 items-center justify-center p-0"
      >
        <Aspa />
      </button>
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
      className="size-5"
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
      strokeWidth="2.1"
      strokeLinecap="round"
      aria-hidden="true"
      className="size-5"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
