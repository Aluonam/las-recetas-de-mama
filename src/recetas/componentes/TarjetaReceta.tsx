import { Link } from 'react-router-dom'
import type { RecetaResumen } from '../tipos'

/**
 * Una receta en la portada, como etiqueta de tarro de conserva: filete
 * doble, arco arriba, todo centrado, quién la hacía en versalitas y el
 * plato en grande.
 */
export function TarjetaReceta({ receta }: { receta: RecetaResumen }) {
  return (
    <Link
      to={`/receta/${receta.id}`}
      className="marco-doble arco flex h-full flex-col bg-superficie p-4 text-center no-underline transition-transform hover:-translate-y-0.5"
    >
      {receta.fotoPortadaUrl ? (
        <img
          src={receta.fotoPortadaUrl}
          alt=""
          loading="lazy"
          className="arco mb-3 aspect-[4/3] w-full object-cover"
        />
      ) : (
        <div className="guirnalda mb-1 mt-2" aria-hidden="true" />
      )}

      {receta.autorNombre && (
        <p className="versalitas mb-1 text-rosa-texto">De {receta.autorNombre}</p>
      )}

      <h2 className="mb-1 text-xl">{receta.titulo}</h2>

      {receta.descripcion && (
        <p className="line-clamp-2 text-sm text-tinta-suave">
          {receta.descripcion}
        </p>
      )}

      {receta.ocasiones.length > 0 && (
        <p className="versalitas mt-auto pt-3 text-tinta-suave">
          {receta.ocasiones.join(' · ')}
        </p>
      )}
    </Link>
  )
}
