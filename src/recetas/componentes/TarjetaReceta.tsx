import { Link } from 'react-router-dom'
import type { RecetaResumen } from '../tipos'

/** Una receta en la portada del recetario. */
export function TarjetaReceta({ receta }: { receta: RecetaResumen }) {
  return (
    <Link
      to={`/receta/${receta.id}`}
      className="tarjeta block h-full overflow-hidden no-underline transition-shadow hover:shadow-md"
    >
      {receta.fotoPortadaUrl ? (
        <img
          src={receta.fotoPortadaUrl}
          alt=""
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div className="aspect-[4/3] w-full bg-superficie-2" aria-hidden="true" />
      )}

      <div className="p-4">
        <h2 className="mb-1 text-lg sm:text-xl">{receta.titulo}</h2>

        {receta.autorNombre && (
          <p className="mb-2 text-sm text-acento">De {receta.autorNombre}</p>
        )}

        {receta.descripcion && (
          <p className="line-clamp-2 text-sm text-tinta-suave">
            {receta.descripcion}
          </p>
        )}

        {receta.ocasiones.length > 0 && (
          <p className="mt-3 text-xs text-tinta-suave">
            {receta.ocasiones.join(' · ')}
          </p>
        )}
      </div>
    </Link>
  )
}
