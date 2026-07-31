import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { RecetaResumen } from '../tipos'
import { tituloParaOrdenar } from '../indice/agrupar'
import { useNavegacionLibro } from './useNavegacionLibro'
import type { Sentido } from './useNavegacionLibro'
import { useRecetaCompleta } from './useRecetaCompleta'
import { useHojaGirando } from './useHojaGirando'
import { PaginaIzquierda } from './PaginaIzquierda'
import { PaginaDerecha } from './PaginaDerecha'
import { PestanasIndice } from './PestanasIndice'
import { HojaGirando } from './HojaGirando'

/** Un libro va en orden, ignorando el artículo del título. */
function ordenarComoLibro(recetas: RecetaResumen[]) {
  return [...recetas].sort((a, b) =>
    tituloParaOrdenar(a.titulo).localeCompare(tituloParaOrdenar(b.titulo), 'es'),
  )
}

/** Margen para distinguir un clic suelto de los dos de abrir, en ms. */
const ESPERA_DOBLE_CLIC = 260

/**
 * El recetario como libro.
 *
 * Cada receta ocupa las dos páginas: a la izquierda la foto y los
 * ingredientes —lo que se mira antes de cocinar—, a la derecha la
 * elaboración. Es el reparto de cualquier libro de cocina, y le da a
 * cada receta el sitio que en media página no tenía.
 *
 * El índice no ocupa ninguna hoja: va troquelado en el canto, que es
 * donde vive en un recetario de casa.
 *
 * En pantallas pequeñas solo cabe una página, así que se queda la
 * elaboración escondida detrás del desplazamiento y desaparecen las
 * pestañas: para buscar ya está la vista de Índice.
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
  const navegar = useNavigate()

  /**
   * La página es la del tomo, no la del montón que tengas delante: buscar
   * o filtrar enseña unas hojas y esconde otras, pero a nadie se le
   * renumeran las páginas de un libro por leerlo salteado.
   *
   * Cada receta se lleva dos números, porque ocupa las dos caras.
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
  const girando = useHojaGirando(resumen ? { resumen, receta } : null)

  /**
   * Un clic pasa hoja; dos abren la receta.
   *
   * El navegador manda el primer clic antes de saber que viene el
   * segundo, así que pasar hoja espera un momento: si llega el doble
   * clic se cancela y se abre la receta. Sin esa espera, abrir una receta
   * pasaría dos hojas por el camino.
   */
  const relojClic = useRef<number | null>(null)

  const cancelarClic = () => {
    if (relojClic.current === null) return
    window.clearTimeout(relojClic.current)
    relojClic.current = null
  }

  useEffect(() => cancelarClic, [])

  /**
   * Pulsar en una hoja la pasa. Se aparta cuando lo pulsado es un enlace
   * o un botón, o cuando hay texto seleccionado, para no pasar hoja a
   * quien solo estaba copiando un ingrediente.
   */
  const alPulsarHoja =
    (haciaDonde: Sentido) => (evento: React.MouseEvent<HTMLElement>) => {
      if ((evento.target as HTMLElement).closest('a, button')) return
      if (window.getSelection()?.toString()) return

      cancelarClic()
      relojClic.current = window.setTimeout(() => {
        relojClic.current = null
        pasar(haciaDonde)
      }, ESPERA_DOBLE_CLIC)
    }

  const alPulsarDosVeces = (evento: React.MouseEvent<HTMLElement>) => {
    if ((evento.target as HTMLElement).closest('a, button')) return

    cancelarClic()
    navegar(`/receta/${resumen.id}`)
  }

  if (!resumen) return null

  const numero = paginaDe.get(resumen.id) ?? indice * 2 + 2

  return (
    <div {...gestos}>
      <div className="libro">
        <div className="paginas overflow-hidden">
          <div
            // Cambiar la key reinicia las animaciones: cada receta las
            // arranca de cero.
            key={resumen.id}
            className={sentido === 'adelante' ? 'pasa-adelante' : 'pasa-atras'}
          >
            <div
              onDoubleClick={alPulsarDosVeces}
              className="doble-pagina relative grid md:grid-cols-2"
            >
              {/* Izquierda pasa atrás, derecha adelante: se pasa hoja
                  hacia el lado que se toca, como en el papel. */}
              <div
                onClick={alPulsarHoja('atras')}
                className={
                  'hidden md:block md:h-full ' +
                  (indice > 0 ? 'cursor-pointer' : 'cursor-default')
                }
              >
                <PaginaIzquierda
                  receta={receta}
                  resumen={resumen}
                  numero={numero}
                />
              </div>

              {/* En móvil solo hay una página y es esta, así que lleva
                  las dos mitades una debajo de otra. */}
              <div
                onClick={alPulsarHoja('adelante')}
                className={
                  'md:h-full ' +
                  (indice < enOrden.length - 1
                    ? 'cursor-pointer'
                    : 'cursor-default')
                }
              >
                <div className="md:hidden">
                  <PaginaIzquierda
                    receta={receta}
                    resumen={resumen}
                    numero={numero}
                  />
                </div>
                <PaginaDerecha
                  receta={receta}
                  resumen={resumen}
                  numero={numero + 1}
                />
              </div>

              {/* El pliegue entre las dos páginas. Solo cuando hay dos. */}
              <div
                aria-hidden="true"
                className="lomo pointer-events-none absolute inset-y-0 left-1/2 hidden w-10 -translate-x-1/2 md:block"
              />

              {/**
               * La hoja que pasa.
               *
               * Lleva por delante la página derecha y por detrás la
               * izquierda, que es como está hecha una hoja de verdad: lo
               * que dejas de leer y lo que aparece al otro lado.
               *
               * Hacia delante se levanta la receta que estabas leyendo y
               * al caer enseña la portada de la siguiente. Hacia atrás
               * viene tumbada desde la izquierda con la portada de la que
               * dejas, y se posa enseñando la elaboración de la que
               * recuperas.
               */}
              {girando && (
                <HojaGirando
                  sentido={sentido}
                  delante={
                    sentido === 'adelante' ? (
                      <PaginaDerecha
                        receta={girando.receta}
                        resumen={girando.resumen}
                        numero={(paginaDe.get(girando.resumen.id) ?? 0) + 1}
                      />
                    ) : (
                      <PaginaDerecha
                        receta={receta}
                        resumen={resumen}
                        numero={numero + 1}
                      />
                    )
                  }
                  detras={
                    sentido === 'adelante' ? (
                      <PaginaIzquierda
                        receta={receta}
                        resumen={resumen}
                        numero={numero}
                      />
                    ) : (
                      <PaginaIzquierda
                        receta={girando.receta}
                        resumen={girando.resumen}
                        numero={paginaDe.get(girando.resumen.id) ?? 0}
                      />
                    )
                  }
                />
              )}

              {/* La sombra que proyecta la hoja al quedarse de canto. */}
              {girando && (
                <div
                  aria-hidden="true"
                  className="sombra-lomo hidden md:block"
                />
              )}

              <PestanasIndice
                recetas={enOrden}
                abierta={indice}
                alElegir={irA}
              />
            </div>
          </div>
        </div>
      </div>

      <Contador indice={indice} total={enOrden.length} receta={resumen} />
    </div>
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
