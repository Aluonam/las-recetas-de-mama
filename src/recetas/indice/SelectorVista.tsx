import type { ReactNode } from 'react'
import type { Agrupacion } from './agrupar'
import type { Vista } from './usePreferenciaVista'

interface Props {
  vista: Vista
  agrupacion: Agrupacion
  alCambiar: (parche: { vista?: Vista; agrupacion?: Agrupacion }) => void
}

const AGRUPACIONES: Array<{ valor: Agrupacion; texto: string }> = [
  { valor: 'plato', texto: 'Plato' },
  { valor: 'quien', texto: 'Quién la hacía' },
  { valor: 'ocasion', texto: 'Ocasión' },
]

/** Fichas o índice, y por qué se agrupa el índice. */
export function SelectorVista({ vista, agrupacion, alCambiar }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div
        className="flex items-center gap-2"
        role="group"
        aria-label="Forma de ver el recetario"
      >
        <Opcion
          activa={vista === 'fichas'}
          onClick={() => alCambiar({ vista: 'fichas' })}
        >
          Fichas
        </Opcion>
        <Opcion
          activa={vista === 'indice'}
          onClick={() => alCambiar({ vista: 'indice' })}
        >
          Índice
        </Opcion>
      </div>

      {vista === 'indice' && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="versalitas text-tinta-suave">Ordenar por</span>
          <div role="group" aria-label="Agrupar el índice por" className="flex gap-2">
            {AGRUPACIONES.map(({ valor, texto }) => (
              <Opcion
                key={valor}
                activa={agrupacion === valor}
                onClick={() => alCambiar({ agrupacion: valor })}
              >
                {texto}
              </Opcion>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Opcion({
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
