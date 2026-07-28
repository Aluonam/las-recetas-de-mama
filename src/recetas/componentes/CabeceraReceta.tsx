import { Link } from 'react-router-dom'
import type { Receta } from '../tipos'
import { textoProcedencia, textoTiempo } from '../formato'

interface Props {
  receta: Receta
  /** Solo quien creó la receta puede borrarla. */
  puedeBorrar: boolean
  alBorrar: () => void
}

/** Portada de la ficha: foto, título, de quién viene y qué se puede hacer. */
export function CabeceraReceta({ receta, puedeBorrar, alBorrar }: Props) {
  const procedencia = textoProcedencia(receta.procedencia)
  const tiempo = textoTiempo(receta.tiempoMinutos)

  return (
    <header className="mb-8">
      {receta.fotoPortadaUrl && (
        <img
          src={receta.fotoPortadaUrl}
          alt=""
          className="mb-6 aspect-[16/9] w-full rounded-xl object-cover"
        />
      )}

      <h1 className="mb-2 text-3xl sm:text-4xl">{receta.titulo}</h1>

      {procedencia && <p className="mb-1 text-lg text-acento">{procedencia}</p>}

      {receta.procedencia.aprendidaDe && (
        <p className="text-tinta-suave">{receta.procedencia.aprendidaDe}</p>
      )}

      {receta.descripcion && (
        <p className="mt-3 text-tinta-suave">{receta.descripcion}</p>
      )}

      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 text-sm">
        {receta.raciones && <Dato termino="Para" valor={receta.raciones} />}
        {tiempo && <Dato termino="Tiempo" valor={tiempo} />}
        {receta.ocasiones.length > 0 && (
          <Dato termino="Se hace en" valor={receta.ocasiones.join(', ')} />
        )}
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to={`/receta/${receta.id}/cocinar`}
          className="boton-principal flex-1 no-underline sm:flex-none"
        >
          Cocinar
        </Link>
        <Link
          to={`/receta/${receta.id}/editar`}
          className="boton-secundario flex-1 no-underline sm:flex-none"
        >
          Editar
        </Link>
        {puedeBorrar && (
          <button type="button" onClick={alBorrar} className="boton-secundario">
            Borrar
          </button>
        )}
      </div>
    </header>
  )
}

function Dato({ termino, valor }: { termino: string; valor: string }) {
  return (
    <div>
      <dt className="text-tinta-suave">{termino}</dt>
      <dd className="m-0 font-semibold">{valor}</dd>
    </div>
  )
}
