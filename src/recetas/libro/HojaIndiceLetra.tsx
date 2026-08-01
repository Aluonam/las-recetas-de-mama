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
      <Cabecera rotulo="En la letra">
        <p
          aria-hidden="true"
          className="text-center font-titulo text-6xl font-bold leading-none text-verde-texto"
        >
          {letra}
        </p>
      </Cabecera>

      <Entradas
        recetas={recetas}
        paginaDe={paginaDe}
        alElegir={alElegir}
        desde={0}
        hasta={CABEN_EN_UNA_CARA}
      />

      <p
        aria-hidden="true"
        className="numero-pagina absolute bottom-5 left-14 font-titulo text-sm text-tinta-suave sm:left-16"
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
          {/* La cabecera mide lo mismo que la de enfrente aunque no
              lleve la letra grande, así que las dos guirnaldas caen a la
              misma altura y el libro se lee como un pliego y no como dos
              hojas sueltas. */}
          <Cabecera rotulo={`Sigue la ${letra}`} />
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
           El adorno va a la altura del de enfrente, no en mitad de la
           página: puestos a dejar la cara vacía, que al menos las dos
           guirnaldas hagan una sola línea de lado a lado. */
        <Cabecera rotulo="" />
      )}

      <p
        aria-hidden="true"
        className="numero-pagina absolute bottom-5 right-6 font-titulo text-sm text-tinta-suave sm:right-8"
      >
        {numero}
      </p>
    </article>
  )
}

/**
 * La cabecera de una cara del índice, de alto fijo.
 *
 * El alto es lo importante. La cara izquierda lleva la letra grande y la
 * derecha no, así que dejadas a su aire la guirnalda de una caía a media
 * página de la otra y el pliegue partía el libro en dos hojas sueltas.
 * Con el alto clavado, las dos guirnaldas hacen una sola línea que cruza
 * de lado a lado.
 *
 * Lo de dentro se apoya abajo, contra la guirnalda, para que crezca
 * hacia arriba y no la mueva.
 */
function Cabecera({
  rotulo,
  children,
}: {
  rotulo: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex h-24 flex-col justify-end sm:h-28">
      {rotulo ? (
        <p className="versalitas mb-1 text-center text-rosa-texto">{rotulo}</p>
      ) : (
        <span className="sr-only">Esta cara se queda en blanco.</span>
      )}

      {children}

      <div className="guirnalda mt-2" aria-hidden="true" />
    </div>
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
