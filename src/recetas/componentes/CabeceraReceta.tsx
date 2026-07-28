import { Link } from 'react-router-dom'
import type { Receta } from '../tipos'
import { textoProcedencia, textoTiempo } from '../formato'

interface Props {
  receta: Receta
  /** Solo quien creó la receta puede borrarla. */
  puedeBorrar: boolean
  alBorrar: () => void
}

/**
 * Portada de la ficha, compuesta como la etiqueta de un tarro: la foto en
 * arco, quién la hacía en versalitas encima del plato, y el año en cursiva
 * debajo.
 */
export function CabeceraReceta({ receta, puedeBorrar, alBorrar }: Props) {
  const procedencia = textoProcedencia(receta.procedencia)
  const tiempo = textoTiempo(receta.tiempoMinutos)

  return (
    <header className="mb-8 text-center">
      {receta.fotoPortadaUrl && (
        <img
          src={receta.fotoPortadaUrl}
          alt=""
          className="arco marco-oro mx-auto mb-6 aspect-[16/9] w-full object-cover"
        />
      )}

      <div className="guirnalda mx-auto max-w-sm" aria-hidden="true" />

      {procedencia && (
        <p className="versalitas mb-1 text-rosa-texto">{procedencia}</p>
      )}

      <h1 className="mb-2 text-3xl sm:text-4xl">{receta.titulo}</h1>

      {receta.procedencia.aprendidaDe && (
        <p className="font-titulo italic text-tinta-suave">
          {receta.procedencia.aprendidaDe}
        </p>
      )}

      {receta.descripcion && (
        <p className="mt-3 text-tinta-suave">{receta.descripcion}</p>
      )}

      <dl className="mt-5 flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm">
        {receta.raciones && <Dato termino="Para" valor={receta.raciones} />}
        {tiempo && <Dato termino="Tiempo" valor={tiempo} />}
        {receta.ocasiones.length > 0 && (
          <Dato termino="Se hace en" valor={receta.ocasiones.join(', ')} />
        )}
      </dl>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
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
      <dt className="versalitas text-tinta-suave">{termino}</dt>
      <dd className="m-0 font-semibold">{valor}</dd>
    </div>
  )
}
