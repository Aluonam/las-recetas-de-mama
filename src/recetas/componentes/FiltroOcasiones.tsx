interface Props {
  ocasiones: string[]
  seleccionada: string | null
  alSeleccionar: (ocasion: string | null) => void
}

/**
 * Filtro por ocasión. Deja navegar el recetario por recuerdo —"lo de
 * Nochebuena"— en vez de por ingrediente.
 */
export function FiltroOcasiones({ ocasiones, seleccionada, alSeleccionar }: Props) {
  if (ocasiones.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por ocasión">
      <Chip activo={seleccionada === null} onClick={() => alSeleccionar(null)}>
        Todas
      </Chip>

      {ocasiones.map((ocasion) => (
        <Chip
          key={ocasion}
          activo={seleccionada === ocasion}
          onClick={() => alSeleccionar(seleccionada === ocasion ? null : ocasion)}
        >
          {ocasion}
        </Chip>
      ))}
    </div>
  )
}

function Chip({
  activo,
  onClick,
  children,
}: {
  activo: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={
        'rounded-full border px-3 py-1.5 text-sm transition-colors ' +
        (activo
          ? 'border-acento bg-acento text-acento-tinta'
          : 'border-borde bg-superficie text-tinta-suave hover:bg-superficie-2')
      }
    >
      {children}
    </button>
  )
}
