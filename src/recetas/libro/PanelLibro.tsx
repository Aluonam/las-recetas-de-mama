import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Receta, RecetaResumen } from '../tipos'
import { textoCantidad, textoTiempo } from '../formato'
import { tituloParaOrdenar } from '../indice/agrupar'
import { useNavegacionLibro } from './useNavegacionLibro'
import { useRecetaCompleta } from './useRecetaCompleta'

/**
 * El recetario como libro: cada receta ocupa una hoja, y las hojas se
 * pasan.
 *
 * La hoja izquierda se pinta con lo que ya tenemos del listado, así que
 * nunca parpadea al pasar. La derecha necesita la receta entera y aparece
 * en cuanto llega; en la práctica es instantáneo salvo la primera vez.
 */
export function PanelLibro({ recetas }: { recetas: RecetaResumen[] }) {
  // Un libro va en orden, ignorando el artículo del título.
  const enOrden = useMemo(
    () =>
      [...recetas].sort((a, b) =>
        tituloParaOrdenar(a.titulo).localeCompare(tituloParaOrdenar(b.titulo), 'es'),
      ),
    [recetas],
  )

  const { indice, sentido, pasar, gestos } = useNavegacionLibro(enOrden.length)
  const resumen = enOrden[indice]
  const { receta } = useRecetaCompleta(resumen?.id)

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
              <HojaIzquierda resumen={resumen} numero={indice * 2 + 1} />
              <HojaDerecha
                receta={receta}
                resumen={resumen}
                numero={indice * 2 + 2}
              />

              {/* El pliegue entre las dos páginas. Solo cuando hay dos. */}
              <div
                aria-hidden="true"
                className="lomo pointer-events-none absolute inset-y-0 left-1/2 hidden w-10 -translate-x-1/2 md:block"
              />
            </div>
          </div>
        </div>
      </div>

      <Controles
        indice={indice}
        total={enOrden.length}
        alPasar={pasar}
        receta={resumen}
      />
    </div>
  )
}

function HojaIzquierda({
  resumen,
  numero,
}: {
  resumen: RecetaResumen
  numero: number
}) {
  const tiempo = textoTiempo(resumen.tiempoMinutos)

  return (
    <article className="hoja hoja-izq flex flex-col p-6 text-center sm:p-8">
      {resumen.fotoPortadaUrl ? (
        <img
          src={resumen.fotoPortadaUrl}
          alt=""
          className="arco marco-doble mx-auto mb-6 aspect-[4/3] w-full max-w-xs object-cover"
        />
      ) : (
        <div className="guirnalda mb-4" aria-hidden="true" />
      )}

      {resumen.autorNombre && (
        <p className="versalitas mb-2 text-rosa-texto">De {resumen.autorNombre}</p>
      )}

      <h2 className="mb-3 text-2xl sm:text-3xl">{resumen.titulo}</h2>

      {resumen.descripcion && (
        <p className="font-titulo italic text-tinta-suave">
          {resumen.descripcion}
        </p>
      )}

      <dl className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
        {tiempo && (
          <div>
            <dt className="versalitas text-tinta-suave">Tiempo</dt>
            <dd className="m-0 font-semibold">{tiempo}</dd>
          </div>
        )}
        {resumen.ocasiones.length > 0 && (
          <div>
            <dt className="versalitas text-tinta-suave">Se hace en</dt>
            <dd className="m-0 font-semibold">{resumen.ocasiones.join(', ')}</dd>
          </div>
        )}
      </dl>

      <PieDePagina numero={numero} alineado="izquierda" />
    </article>
  )
}

function HojaDerecha({
  receta,
  resumen,
  numero,
}: {
  receta: Receta | null
  resumen: RecetaResumen
  numero: number
}) {
  return (
    <article className="hoja hoja-der flex flex-col p-6 sm:p-8">
      {receta ? (
        <>
          {receta.porQueEspecial && (
            <p className="mb-6 border-l-4 border-rosa-medio pl-4 font-titulo italic">
              {receta.porQueEspecial}
            </p>
          )}

          <h3 className="versalitas mb-3 text-tinta-suave">Ingredientes</h3>
          <ul className="m-0 mb-6 list-none space-y-1.5 p-0">
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
              <h3 className="versalitas mb-2 text-tinta-suave">
                El truco de la casa
              </h3>
              <p className="mb-6 text-tinta-suave">{receta.trucos[0].texto}</p>
            </>
          )}

          <Link
            to={`/receta/${resumen.id}`}
            className="boton-principal mt-auto self-center no-underline"
          >
            Abrir la receta
          </Link>
        </>
      ) : (
        <p role="status" className="my-auto text-center text-tinta-suave">
          Abriendo la hoja…
        </p>
      )}

      <PieDePagina numero={numero} alineado="derecha" />
    </article>
  )
}

function PieDePagina({
  numero,
  alineado,
}: {
  numero: number
  alineado: 'izquierda' | 'derecha'
}) {
  return (
    <p
      aria-hidden="true"
      className={
        'mt-6 font-titulo text-sm text-tinta-suave ' +
        (alineado === 'izquierda' ? 'text-left' : 'text-right')
      }
    >
      {numero}
    </p>
  )
}

function Controles({
  indice,
  total,
  alPasar,
  receta,
}: {
  indice: number
  total: number
  alPasar: (sentido: 'adelante' | 'atras') => void
  receta: RecetaResumen
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
      <button
        type="button"
        className="boton-secundario"
        onClick={() => alPasar('atras')}
        disabled={indice === 0}
      >
        ← Anterior
      </button>

      <p role="status" className="text-center text-sm text-tinta-suave">
        <span className="sr-only">Hoja abierta: {receta.titulo}. </span>
        {indice + 1} de {total}
      </p>

      <button
        type="button"
        className="boton-secundario"
        onClick={() => alPasar('adelante')}
        disabled={indice === total - 1}
      >
        Siguiente →
      </button>
    </div>
  )
}
