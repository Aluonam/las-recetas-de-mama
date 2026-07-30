import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Receta, RecetaResumen } from '../tipos'
import { textoCantidad, textoTiempo } from '../formato'
import { tituloParaOrdenar } from '../indice/agrupar'
import { useNavegacionLibro } from './useNavegacionLibro'
import type { Sentido } from './useNavegacionLibro'
import { useRecetaCompleta } from './useRecetaCompleta'
import { HojaIndice } from './HojaIndice'
import { Imagen } from '../archivos/Imagen'

/** Un libro va en orden, ignorando el artículo del título. */
function ordenarComoLibro(recetas: RecetaResumen[]) {
  return [...recetas].sort((a, b) =>
    tituloParaOrdenar(a.titulo).localeCompare(tituloParaOrdenar(b.titulo), 'es'),
  )
}

/**
 * El recetario como libro.
 *
 * A la izquierda el índice, a la derecha la receta abierta. Es como está
 * hecho un recetario de casa: abres por cualquier sitio y en la página de
 * al lado tienes la lista para saltar a otra.
 *
 * En pantallas pequeñas solo cabe una página, así que se queda la receta
 * y el índice desaparece: para buscar ya está la vista de Índice.
 */
export function PanelLibro({
  recetas,
  todas,
}: {
  recetas: RecetaResumen[]
  /** El recetario entero, para numerar las páginas. */
  todas: RecetaResumen[]
}) {
  const enOrden = useMemo(() => ordenarComoLibro(recetas), [recetas])

  /**
   * La página es la del tomo, no la del montón que tengas delante: buscar
   * o filtrar enseña unas hojas y esconde otras, pero a nadie se le
   * renumeran las páginas de un libro por leerlo salteado.
   */
  const paginaDe = useMemo(() => {
    const tomo = ordenarComoLibro(todas)
    return new Map(tomo.map((receta, posicion) => [receta.id, posicion * 2 + 2]))
  }, [todas])

  const { indice, sentido, pasar, irA, gestos } = useNavegacionLibro(
    enOrden.length,
  )
  const resumen = enOrden[indice]
  const { receta } = useRecetaCompleta(resumen?.id)

  /**
   * Pulsar en la hoja de la receta la pasa. Se aparta cuando lo pulsado es
   * un enlace o cuando hay texto seleccionado, para no pasar hoja a quien
   * solo estaba copiando un ingrediente.
   */
  const alPulsarHoja =
    (haciaDonde: Sentido) => (evento: React.MouseEvent<HTMLElement>) => {
      if ((evento.target as HTMLElement).closest('a, button')) return
      if (window.getSelection()?.toString()) return
      pasar(haciaDonde)
    }

  if (!resumen) return null

  return (
    <div className="pasando" {...gestos}>
      <div className="libro">
        <div className="paginas overflow-hidden">
          <div
            // Cambiar la key reinicia la animación: cada hoja entra girada
            // sobre el lomo y cae hasta quedar plana.
            key={resumen.id}
            className={sentido === 'adelante' ? 'pasa-adelante' : 'pasa-atras'}
          >
            <div className="relative grid md:grid-cols-2">
              <HojaIndice
                recetas={enOrden}
                abierta={resumen.id}
                alElegir={irA}
              />

              <HojaReceta
                receta={receta}
                resumen={resumen}
                numero={paginaDe.get(resumen.id) ?? indice * 2 + 2}
                alPulsar={alPulsarHoja('adelante')}
                activa={indice < enOrden.length - 1}
              />

              {/* El pliegue entre las dos páginas. Solo cuando hay dos. */}
              <div
                aria-hidden="true"
                className="lomo pointer-events-none absolute inset-y-0 left-1/2 hidden w-10 -translate-x-1/2 md:block"
              />

              {/* La sombra que deja la hoja al caer sobre la de abajo. */}
              <div
                aria-hidden="true"
                className={
                  'barrido ' +
                  (sentido === 'adelante' ? 'barrido-adelante' : 'barrido-atras')
                }
              />
            </div>
          </div>
        </div>
      </div>

      <Contador indice={indice} total={enOrden.length} receta={resumen} />
    </div>
  )
}

function HojaReceta({
  receta,
  resumen,
  numero,
  alPulsar,
  activa,
}: {
  receta: Receta | null
  resumen: RecetaResumen
  numero: number
  alPulsar: (evento: React.MouseEvent<HTMLElement>) => void
  activa: boolean
}) {
  const tiempo = textoTiempo(resumen.tiempoMinutos)

  return (
    <article
      onClick={alPulsar}
      className={
        'hoja hoja-der relative flex flex-col p-6 pb-14 sm:p-8 sm:pb-16 ' +
        (activa ? 'cursor-pointer' : 'cursor-default')
      }
    >
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

      <div className="mt-6 flex-1">
        {receta ? (
          <>
            {receta.porQueEspecial && (
              <p className="mb-5 border-l-4 border-rosa-medio pl-4 font-titulo italic">
                {receta.porQueEspecial}
              </p>
            )}

            <h3 className="versalitas mb-2 text-tinta-suave">Ingredientes</h3>
            <ul className="m-0 mb-5 list-none space-y-1.5 p-0">
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

            {receta.trucos.length > 0 && (
              <>
                <h3 className="versalitas mb-1 text-tinta-suave">
                  El truco de la casa
                </h3>
                <p className="mb-5 text-tinta-suave">{receta.trucos[0].texto}</p>
              </>
            )}

            <div className="text-center">
              <Link
                to={`/receta/${resumen.id}`}
                className="boton-principal no-underline"
              >
                Abrir la receta
              </Link>
            </div>
          </>
        ) : (
          <p role="status" className="py-8 text-center text-tinta-suave">
            Abriendo la hoja…
          </p>
        )}
      </div>

      <p
        aria-hidden="true"
        className="absolute bottom-5 right-6 font-titulo text-sm text-tinta-suave sm:right-8"
      >
        {numero}
      </p>
    </article>
  )
}

function Contador({
  indice,
  total,
  receta,
}: {
  indice: number
  total: number
  receta: RecetaResumen
}) {
  return (
    <p role="status" className="mt-6 text-center text-sm text-tinta-suave">
      <span className="sr-only">Hoja abierta: {receta.titulo}. </span>
      {indice + 1} de {total}
    </p>
  )
}
