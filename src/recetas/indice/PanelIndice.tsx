import { Link } from 'react-router-dom'
import type { RecetaResumen } from '../tipos'
import { textoTiempo } from '../formato'
import { agrupar, anclaDe } from './agrupar'
import type { Agrupacion } from './agrupar'
import { GuiaAlfabeto } from './GuiaAlfabeto'

interface Props {
  recetas: RecetaResumen[]
  modo: Agrupacion
}

/**
 * El recetario como índice de libro: una entrada por línea, con puntos
 * que enlazan el plato con quién lo hacía.
 *
 * La letra se queda pegada arriba mientras se baja, y la guía lateral
 * permite saltar. En móvil la guía desaparece: no hay sitio, y ahí se
 * navega deslizando.
 */
export function PanelIndice({ recetas, modo }: Props) {
  const grupos = agrupar(recetas, modo)

  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div>
        {grupos.map((grupo) => (
          <section key={grupo.clave} className="mb-10">
            <h2
              id={anclaDe(grupo.clave)}
              // scroll-mt deja aire al saltar, para que el encabezado no
              // quede tapado por sí mismo.
              className="sticky top-0 z-10 scroll-mt-4 border-b border-borde bg-papel py-2 font-titulo text-2xl text-verde-texto"
            >
              {grupo.clave}
            </h2>

            <ul className="m-0 list-none p-0">
              {grupo.recetas.map((receta) => (
                <li key={receta.id}>
                  <Entrada receta={receta} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {modo === 'plato' && (
        <GuiaAlfabeto letras={grupos.map((grupo) => grupo.clave)} />
      )}
    </div>
  )
}

/** Una línea del índice, con los puntos del libro. */
function Entrada({ receta }: { receta: RecetaResumen }) {
  const tiempo = textoTiempo(receta.tiempoMinutos)

  return (
    <Link
      to={`/receta/${receta.id}`}
      className="flex items-baseline gap-1 py-2.5 no-underline hover:bg-superficie-2"
    >
      <span className="font-titulo text-lg text-verde-texto">
        {receta.titulo}
      </span>

      {/* Los puntos que llevan de un lado a otro, como en un índice. */}
      <span
        aria-hidden="true"
        className="mx-1 min-w-4 flex-1 translate-y-[-0.3em] border-b border-dotted border-borde"
      />

      {receta.autorNombre && (
        <span className="versalitas shrink-0 text-rosa-texto">
          {receta.autorNombre}
        </span>
      )}

      {tiempo && (
        <span className="ml-3 hidden shrink-0 text-sm text-tinta-suave sm:inline">
          {tiempo}
        </span>
      )}
    </Link>
  )
}
