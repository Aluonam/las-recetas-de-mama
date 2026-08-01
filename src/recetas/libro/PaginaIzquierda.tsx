import type { Receta, RecetaResumen } from '../tipos'
import { textoCantidad, textoTiempo } from '../formato'
import { Imagen } from '../archivos/Imagen'
import { CuerpoDesplazable } from './CuerpoDesplazable'

/**
 * La cara izquierda de la receta: quién es y qué hace falta.
 *
 * Es la mitad que se mira antes de cocinar —la foto para decidir, la
 * lista para ir a comprar— y por eso lleva la portada y los
 * ingredientes. La elaboración va enfrente, donde se lee ya con las
 * manos en la masa.
 *
 * La cabecera sale del resumen, que llega con el listado; los
 * ingredientes necesitan la receta entera y tardan un poco más. Se pinta
 * lo que hay: así la hoja tiene título y foto desde el primer momento en
 * vez de quedarse en blanco esperando.
 */
export function PaginaIzquierda({
  receta,
  resumen,
  numero,
}: {
  receta: Receta | null
  resumen: RecetaResumen
  numero: number
}) {
  const tiempo = textoTiempo(resumen.tiempoMinutos)

  return (
    <article className="hoja hoja-izq relative flex h-full flex-col p-6 pb-14 pl-14 sm:p-8 sm:pb-16 sm:pl-16">
      <div className="text-center">
        <Imagen
          archivo={resumen.fotoPortadaUrl}
          className="arco marco-doble mx-auto mb-5 aspect-[4/3] w-full max-w-[15rem] object-cover"
          hueco={<div className="guirnalda mb-3" aria-hidden="true" />}
        />

        {resumen.autorNombre && (
          <p className="versalitas mb-1 text-rosa-texto">
            De {resumen.autorNombre}
          </p>
        )}

        <h2 className="mb-2 text-2xl sm:text-3xl">{resumen.titulo}</h2>

        {resumen.descripcion && (
          <p className="font-titulo italic text-tinta-suave">
            {resumen.descripcion}
          </p>
        )}

        <dl className="mt-4 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
          {tiempo && (
            <div>
              <dt className="versalitas text-tinta-suave">Tiempo</dt>
              <dd className="m-0 font-semibold">{tiempo}</dd>
            </div>
          )}
          {receta?.raciones && (
            <div>
              <dt className="versalitas text-tinta-suave">Para</dt>
              <dd className="m-0 font-semibold">{receta.raciones}</dd>
            </div>
          )}
          {resumen.ocasiones.length > 0 && (
            <div>
              <dt className="versalitas text-tinta-suave">Se hace en</dt>
              <dd className="m-0 font-semibold">
                {resumen.ocasiones.join(', ')}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="guirnalda my-5" aria-hidden="true" />

      {/* Con muchos ingredientes la lista crece; que se desplace ella y no
          estire el libro entero. Con una sola hoja no: allí se lee de
          arriba abajo y quien se mueve es el papel. Lo decide el CSS. */}
      <CuerpoDesplazable>
        <h3 className="versalitas mb-2 text-center text-tinta-suave">
          Ingredientes
        </h3>

        {receta ? (
          <>
            <ul className="m-0 list-none space-y-1.5 p-0">
              {receta.ingredientes.map((ingrediente) => {
                const cantidad = textoCantidad(ingrediente)
                return (
                  <li key={ingrediente.id} className="flex flex-wrap gap-x-2">
                    <span>{ingrediente.nombre}</span>
                    {cantidad && (
                      <span className="text-rosa-texto">— {cantidad}</span>
                    )}
                  </li>
                )
              })}
            </ul>

            {receta.ingredientes.length === 0 && <Vacio />}

            {receta.materiales.length > 0 && (
              <>
                <h3 className="versalitas mb-2 mt-6 text-center text-tinta-suave">
                  Hace falta
                </h3>
                <ul className="m-0 list-none space-y-1.5 p-0">
                  {receta.materiales.map((material) => (
                    <li key={material.id}>{material.nombre}</li>
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
      </CuerpoDesplazable>

      <p
        aria-hidden="true"
        className="numero-pagina absolute bottom-5 left-14 font-titulo text-sm text-tinta-suave sm:left-16"
      >
        {numero}
      </p>
    </article>
  )
}

/**
 * Un apartado que nadie ha rellenado todavía.
 *
 * Se dice en voz baja y se deja el hueco: una receta a medio escribir es
 * lo normal en un recetario de casa, y ver el sitio vacío es lo que
 * empuja a completarlo.
 */
export function Vacio() {
  return <p className="py-6 text-center italic text-tinta-suave">(vacío)</p>
}
