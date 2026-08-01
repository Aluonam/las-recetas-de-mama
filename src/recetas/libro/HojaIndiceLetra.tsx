import { tituloParaOrdenar } from '../indice/agrupar'
import type { RecetaResumen } from '../tipos'

interface Props {
  letra: string
  recetas: RecetaResumen[]
  /** El número de página de cada receta, para la guía de puntos. */
  paginaDe: (receta: RecetaResumen) => number
  alElegir: (receta: RecetaResumen) => void
  numero: number
}

/**
 * La hoja que abre una letra con varias recetas.
 *
 * Sin esto, llegar a las torrijas en una T con seis recetas era pasar
 * hoja seis veces mirando títulos. La pestaña del canto te deja en la
 * letra; esta hoja te deja en la receta.
 *
 * Va con guía de puntos y número de página, como el índice del final de
 * cualquier libro: es lo que hace que se lea como un índice y no como
 * una lista de botones.
 *
 * Se llena la cara izquierda y solo se pasa a la derecha cuando de
 * verdad no cabe, como en cualquier índice. Antes se repartía a medias
 * siempre, y con dos recetas quedaba una a cada lado de la costura, que
 * es justo lo que no hace un libro.
 */
export function HojaIndiceLetra({
  letra,
  recetas,
  paginaDe,
  alElegir,
  numero,
}: Props) {
  return (
    <article className="hoja hoja-izq relative flex h-full flex-col p-6 pb-14 pl-14 sm:p-8 sm:pb-16 sm:pl-16">
      <p className="versalitas mb-1 text-center text-rosa-texto">En la letra</p>

      <p
        aria-hidden="true"
        className="text-center font-titulo text-6xl font-bold leading-none text-verde-texto"
      >
        {letra}
      </p>

      <div className="guirnalda my-4" aria-hidden="true" />

      <Entradas
        recetas={recetas}
        paginaDe={paginaDe}
        alElegir={alElegir}
        desde={0}
        hasta={CABEN_EN_UNA_CARA}
      />

      <p
        aria-hidden="true"
        className="absolute bottom-5 left-14 font-titulo text-sm text-tinta-suave sm:left-16"
      >
        {numero}
      </p>
    </article>
  )
}

/** La cara derecha: lo que no cabía en la izquierda, si es que no cabía. */
export function HojaIndiceLetraDerecha({
  letra,
  recetas,
  paginaDe,
  alElegir,
  numero,
}: Props) {
  const desde = CABEN_EN_UNA_CARA
  const quedan = recetas.length - desde

  return (
    <article className="hoja hoja-der relative flex h-full flex-col p-6 pb-14 sm:p-8 sm:pb-16">
      {quedan > 0 ? (
        <>
          <p className="versalitas mb-1 text-center text-rosa-texto">
            Sigue la {letra}
          </p>
          <div className="guirnalda mb-4" aria-hidden="true" />
          <Entradas
            recetas={recetas}
            paginaDe={paginaDe}
            alElegir={alElegir}
            desde={desde}
            hasta={recetas.length}
          />
        </>
      ) : (
        /* Papel en blanco, como la hoja de cortesía de cualquier libro.
           Un adorno pequeño evita que parezca que falta algo. */
        <div className="flex h-full items-center justify-center">
          <div className="guirnalda w-2/3 opacity-60" aria-hidden="true" />
        </div>
      )}

      <p
        aria-hidden="true"
        className="absolute bottom-5 right-6 font-titulo text-sm text-tinta-suave sm:right-8"
      >
        {numero}
      </p>
    </article>
  )
}

/**
 * Cuántas entradas caben en una cara.
 *
 * Es un número a ojo y a propósito: la cara izquierda gasta un tercio en
 * la letra grande y la guirnalda, y en lo que queda entran unas catorce
 * líneas. Se dejan doce para no apurar, porque un título largo ocupa
 * más.
 *
 * Podría medirse de verdad con el tamaño real de la caja, pero eso
 * significa pintar, medir y volver a pintar en cada hoja que se pasa,
 * para acertar en un caso —una letra con más de doce recetas— que en un
 * recetario de casa no se da casi nunca. Y si se pasa, la lista se
 * desplaza dentro de su cara y no se pierde nada.
 */
const CABEN_EN_UNA_CARA = 12

function Entradas({
  recetas,
  paginaDe,
  alElegir,
  desde,
  hasta,
}: {
  recetas: RecetaResumen[]
  paginaDe: (receta: RecetaResumen) => number
  alElegir: (receta: RecetaResumen) => void
  desde: number
  hasta: number
}) {
  return (
    <nav className="min-h-0 flex-1 overflow-y-auto">
      <ul className="m-0 list-none p-0">
        {recetas.slice(desde, hasta).map((receta) => (
          <li key={receta.id}>
            <button
              type="button"
              onClick={() => alElegir(receta)}
              className="flex w-full items-baseline gap-1 rounded px-1 py-1.5 text-left transition-colors hover:bg-superficie-2"
            >
              <span className="truncate">
                {tituloParaOrdenar(receta.titulo)}
              </span>
              <span
                aria-hidden="true"
                className="mx-1 min-w-3 flex-1 translate-y-[-0.3em] border-b border-dotted border-borde"
              />
              <span className="shrink-0 font-titulo text-sm text-tinta-suave">
                {paginaDe(receta)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
