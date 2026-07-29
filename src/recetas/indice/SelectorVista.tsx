import type { ReactNode } from 'react'
import type { Agrupacion } from './agrupar'
import type { Vista } from './usePreferenciaVista'

interface Props {
  vista: Vista
  agrupacion: Agrupacion
  alCambiar: (parche: { vista?: Vista; agrupacion?: Agrupacion }) => void
}

const VISTAS: Array<{ valor: Vista; texto: string }> = [
  { valor: 'todos', texto: 'Todas' },
  { valor: 'fichas', texto: 'Fichas' },
  { valor: 'libro', texto: 'Libro' },
  { valor: 'indice', texto: 'Índice' },
]

const AGRUPACIONES: Array<{ valor: Agrupacion; texto: string }> = [
  { valor: 'plato', texto: 'Plato' },
  { valor: 'quien', texto: 'Quién la hacía' },
  { valor: 'ocasion', texto: 'Ocasión' },
]

/**
 * Cómo se mira el recetario, y cómo se agrupa el índice.
 *
 * Las vistas van en solapas de libro y no en píldoras redondas como los
 * filtros, porque no hacen lo mismo: los filtros quitan y ponen recetas,
 * las solapas cambian la manera de mirar las mismas.
 */
export function SelectorVista({ vista, agrupacion, alCambiar }: Props) {
  return (
    <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
      <div className="solapas" role="group" aria-label="Forma de ver el recetario">
        {VISTAS.map(({ valor, texto }) => (
          <button
            key={valor}
            type="button"
            onClick={() => alCambiar({ vista: valor })}
            aria-pressed={vista === valor}
            className={'solapa' + (vista === valor ? ' solapa-activa' : '')}
          >
            {texto}
          </button>
        ))}
      </div>

      {vista === 'indice' && (
        <div className="flex flex-wrap items-center gap-2 pb-1">
          <span className="versalitas text-tinta-suave">Ordenar por</span>
          <div role="group" aria-label="Agrupar el índice por" className="flex gap-2">
            {AGRUPACIONES.map(({ valor, texto }) => (
              <Pildora
                key={valor}
                activa={agrupacion === valor}
                onClick={() => alCambiar({ agrupacion: valor })}
              >
                {texto}
              </Pildora>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Pildora({
  activa,
  onClick,
  children,
}: {
  activa: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={
        'rounded-full border px-3 py-1.5 text-sm transition-colors ' +
        (activa
          ? 'border-verde-texto bg-verde-texto text-papel'
          : 'border-borde bg-superficie text-tinta-suave hover:bg-superficie-2')
      }
    >
      {children}
    </button>
  )
}
