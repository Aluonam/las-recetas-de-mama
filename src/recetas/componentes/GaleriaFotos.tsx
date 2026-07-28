import type { Foto } from '../tipos'

export function GaleriaFotos({ fotos }: { fotos: Foto[] }) {
  if (fotos.length === 0) return null

  return (
    <section className="mt-10">
      <h2 className="mb-3 text-2xl">Fotos</h2>

      <ul className="grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-3">
        {fotos.map((foto) => (
          <li key={foto.id}>
            <img
              src={foto.url}
              alt={foto.pie ?? ''}
              loading="lazy"
              className="aspect-square w-full rounded-lg object-cover"
            />
            {foto.pie && (
              <p className="mt-1 text-sm text-tinta-suave">{foto.pie}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
