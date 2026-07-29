import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { Receta, RecetaResumen } from '../tipos'
import { textoCantidad, textoTiempo } from '../formato'
import { tituloParaOrdenar } from '../indice/agrupar'
import { useNavegacionLibro, type Sentido } from './useNavegacionLibro'
import { useRecetaCompleta } from './useRecetaCompleta'

/** Un libro va en orden, ignorando el artículo del título. */
function ordenarComoLibro(recetas: RecetaResumen[]) {
  return [...recetas].sort((a, b) =>
    tituloParaOrdenar(a.titulo).localeCompare(tituloParaOrdenar(b.titulo), 'es'),
  )
}

/**
 * El recetario como libro: cada receta ocupa una hoja, y las hojas se
 * pasan pulsando sobre ellas.
 *
 * La hoja izquierda se pinta con lo que ya tenemos del listado, así que
 * nunca parpadea al pasar. La derecha necesita la receta entera y aparece
 * en cuanto llega; en la práctica es instantáneo salvo la primera vez.
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
    return new Map(tomo.map((receta, posicion) => [receta.id, posicion * 2 + 1]))
  }, [todas])

  const { indice, sentido, pasar, gestos } = useNavegacionLibro(enOrden.length)
  const resumen = enOrden[indice]
  const { receta } = useRecetaCompleta(resumen?.id)

  /**
   * Pulsar en una hoja la pasa: la de la izquierda va hacia atrás y la de
   * la derecha hacia delante. Se aparta cuando lo pulsado es un enlace o
   * cuando hay texto seleccionado, para no pasar hoja a quien solo estaba
   * copiando un ingrediente.
   */
  const alPulsarHoja =
    (haciaDonde: Sentido) => (evento: React.MouseEvent<HTMLElement>) => {
      if ((evento.target as HTMLElement).closest('a, button')) return
      if (window.getSelection()?.toString()) return
      pasar(haciaDonde)
    }

  if (!resumen) return null

  const primeraPagina = paginaDe.get(resumen.id) ?? indice * 2 + 1
  const quedaAtras = indice > 0
  const quedaAdelante = indice < enOrden.length - 1

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
              <HojaIzquierda
                resumen={resumen}
                numero={primeraPagina}
                alPulsar={alPulsarHoja('atras')}
                activa={quedaAtras}
              />
              <HojaDerecha
                receta={receta}
                resumen={resumen}
                numero={primeraPagina + 1}
                alPulsar={alPulsarHoja('adelante')}
                activa={quedaAdelante}
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

      <Contador indice={indice} total={enOrden.length} receta={resumen} />
    </div>
  )
}

/** El cursor solo promete pasar hoja si de verdad queda hoja que pasar. */
function claseHoja(base: string, activa: boolean) {
  return `${base} ${activa ? 'cursor-pointer' : 'cursor-default'}`
}

function HojaIzquierda({
  resumen,
  numero,
  alPulsar,
  activa,
}: {
  resumen: RecetaResumen
  numero: number
  alPulsar: (evento: React.MouseEvent<HTMLElement>) => void
  activa: boolean
}) {
  const tiempo = textoTiempo(resumen.tiempoMinutos)

  return (
    <article
      onClick={alPulsar}
      className={claseHoja(
        'hoja hoja-izq relative flex flex-col p-6 pb-14 text-center sm:p-8 sm:pb-16',
        activa,
      )}
    >
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
  alPulsar,
  activa,
}: {
  receta: Receta | null
  resumen: RecetaResumen
  numero: number
  alPulsar: (evento: React.MouseEvent<HTMLElement>) => void
  activa: boolean
}) {
  return (
    <article
      onClick={alPulsar}
      className={claseHoja(
        'hoja hoja-der relative flex flex-col p-6 pb-14 sm:p-8 sm:pb-16',
        activa,
      )}
    >
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
  // Clavado al pie de la hoja, como en un libro: si va en el flujo, se
  // queda colgando justo debajo del texto y sube o baja con cada receta.
  return (
    <p
      aria-hidden="true"
      className={
        'absolute bottom-6 font-titulo text-sm text-tinta-suave sm:bottom-8 ' +
        (alineado === 'izquierda' ? 'left-6 sm:left-8' : 'right-6 sm:right-8')
      }
    >
      {numero}
    </p>
  )
}

/**
 * Sin botones, nada delata que las hojas se pasan solas al pulsarlas: el
 * pie hace de instrucción además de contar por dónde vas.
 */
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
      <span aria-hidden="true" className="mx-2">
        ·
      </span>
      <span aria-hidden="true">Pulsa en la hoja para pasarla</span>
      <span className="sr-only">
        Usa las flechas izquierda y derecha para pasar de hoja.
      </span>
    </p>
  )
}
