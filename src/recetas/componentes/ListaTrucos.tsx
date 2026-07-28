import type { Truco } from '../tipos'

/** Los trucos: lo que no está escrito en ningún libro de cocina. */
export function ListaTrucos({
  trucos,
  destacado = false,
}: {
  trucos: Truco[]
  /** En el modo cocina van resaltados: son lo que se olvida. */
  destacado?: boolean
}) {
  if (trucos.length === 0) return null

  return (
    <section
      className={
        destacado ? 'bloque-especial p-5' : 'tarjeta p-4 sm:p-5'
      }
    >
      <h2 className="mb-3 text-2xl">{destacado ? 'No se te olvide' : 'Trucos'}</h2>

      <ul className="m-0 list-disc space-y-3 pl-5">
        {trucos.map((truco) => (
          <li key={truco.id}>
            {truco.texto}
            {truco.deQuien && (
              <span className="block text-sm text-tinta-suave">
                — {truco.deQuien}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
