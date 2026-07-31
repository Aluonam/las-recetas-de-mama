import type { Receta, RecetaResumen } from '../tipos'
import { Vacio } from './PaginaIzquierda'

/**
 * La cara derecha de la receta: cómo se hace.
 *
 * Enfrente están la foto y los ingredientes, así que aquí solo queda el
 * trabajo —el porqué, los pasos y los trucos—. Es el reparto de
 * cualquier libro de cocina: miras a la izquierda para comprar y a la
 * derecha para cocinar.
 *
 * La elaboración conserva su hueco aunque esté sin escribir. Si la
 * página encogiera, el libro cambiaría de alto en cada receta y las
 * hojas bailarían al pasarlas.
 */
export function PaginaDerecha({
  receta,
  resumen,
  numero,
}: {
  receta: Receta | null
  resumen: RecetaResumen
  numero: number
}) {
  return (
    <article className="hoja hoja-der relative flex h-full flex-col p-6 pb-14 sm:p-8 sm:pb-16">
      <p className="versalitas mb-1 text-center text-rosa-texto">
        Cómo se hace
      </p>
      <div className="guirnalda mb-4" aria-hidden="true" />

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {receta ? (
          <>
            {receta.porQueEspecial && (
              <p className="mb-5 border-l-4 border-rosa-medio pl-4 font-titulo italic">
                {receta.porQueEspecial}
              </p>
            )}

            {receta.pasos.length > 0 ? (
              <ol className="m-0 list-none space-y-4 p-0">
                {receta.pasos.map((paso, orden) => (
                  <li key={paso.id} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-titulo text-lg text-rosa-texto"
                    >
                      {orden + 1}.
                    </span>
                    <span>{paso.texto}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <Vacio />
            )}

            {receta.trucos.length > 0 && (
              <>
                <h3 className="versalitas mb-2 mt-6 text-center text-tinta-suave">
                  El truco de la casa
                </h3>
                <ul className="m-0 list-none space-y-3 p-0">
                  {receta.trucos.map((truco) => (
                    <li key={truco.id} className="text-tinta-suave">
                      {truco.texto}
                      {truco.deQuien && (
                        <span className="block font-titulo italic">
                          — {truco.deQuien}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : (
          <p role="status" className="py-8 text-center text-tinta-suave">
            Abriendo la hoja…
          </p>
        )}
      </div>

      <p className="sr-only">Receta abierta: {resumen.titulo}.</p>

      <p
        aria-hidden="true"
        className="absolute bottom-5 right-6 font-titulo text-sm text-tinta-suave sm:right-8"
      >
        {numero}
      </p>
    </article>
  )
}
