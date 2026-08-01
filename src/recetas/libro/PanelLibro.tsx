import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { RecetaResumen } from '../tipos'
import { useNavegacionLibro } from './useNavegacionLibro'
import type { Sentido } from './useNavegacionLibro'
import { useRecetaCompleta } from './useRecetaCompleta'
import { useHojaGirando } from './useHojaGirando'
import type { Pagina } from './useHojaGirando'
import {
  claveDe,
  comienzoDeCadaLetra,
  construirHojas,
  ordenarComoLibro,
} from './hojas'
import type { Hoja } from './hojas'
import { PaginaIzquierda } from './PaginaIzquierda'
import { PaginaDerecha } from './PaginaDerecha'
import { HojaIndiceLetra, HojaIndiceLetraDerecha } from './HojaIndiceLetra'
import { PestanasIndice } from './PestanasIndice'
import { HojaGirando } from './HojaGirando'

/** Margen para distinguir un clic suelto de los dos de abrir, en ms. */
const ESPERA_DOBLE_CLIC = 260

/**
 * El recetario como libro.
 *
 * Cada receta ocupa las dos páginas: a la izquierda la foto y los
 * ingredientes —lo que se mira antes de cocinar—, a la derecha la
 * elaboración.
 *
 * Y no todas las hojas son recetas: donde una letra tiene varias,
 * delante va la suya, como en los tomos antiguos. Así llegar a las
 * torrijas en una T con seis recetas es una pestaña y un toque, en vez
 * de pasar hoja seis veces mirando títulos.
 *
 * Que haya una página o dos no se decide aquí: lo dice `.doble-pagina`
 * en el CSS, mirando el sitio y la forma de la pantalla. Aquí solo se
 * marca qué trozos son de un caso y cuáles del otro —`solo-con-dos`,
 * `solo-con-una`.
 */
export function PanelLibro({
  recetas,
  todas,
  lleno = false,
}: {
  recetas: RecetaResumen[]
  /** El recetario entero, para numerar las páginas. */
  todas: RecetaResumen[]
  /**
   * A pantalla completa manda el alto de la pantalla y no el del papel:
   * el libro se estira hasta llenarla, en vez de medir lo que mida la
   * receta más larga.
   */
  lleno?: boolean
}) {
  const navegar = useNavigate()

  const hojas = useMemo(
    () => construirHojas(ordenarComoLibro(recetas)),
    [recetas],
  )

  /**
   * El número de página es el del tomo, no el del montón que tengas
   * delante: buscar enseña unas hojas y esconde otras, pero a nadie se
   * le renumeran las páginas de un libro por leerlo salteado.
   *
   * Cada hoja se lleva dos números, porque ocupa las dos caras.
   */
  const numeroDe = useMemo(() => {
    const tomo = construirHojas(ordenarComoLibro(todas))
    return new Map(tomo.map((hoja, posicion) => [claveDe(hoja), posicion * 2 + 2]))
  }, [todas])

  const comienzos = useMemo(() => comienzoDeCadaLetra(hojas), [hojas])

  const { indice, sentido, pasar, irA, gestos } = useNavegacionLibro(
    hojas.length,
  )
  const hoja = hojas[indice]

  // Solo las hojas de receta necesitan traerse el cuerpo entero.
  const { receta } = useRecetaCompleta(
    hoja?.tipo === 'receta' ? hoja.resumen.id : undefined,
  )

  const girando = useHojaGirando(
    hoja ? { hoja, receta } : null,
    hoja ? claveDe(hoja) : null,
  )

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
    if (!hoja || hoja.tipo !== 'receta') return

    cancelarClic()
    navegar(`/receta/${hoja.resumen.id}`)
  }

  /** Desde el índice de una letra, saltar a la receta elegida. */
  const abrirPor = (resumen: RecetaResumen) => {
    const destino = hojas.findIndex(
      (una) => una.tipo === 'receta' && una.resumen.id === resumen.id,
    )
    if (destino >= 0) irA(destino)
  }

  if (!hoja) return null

  const numero = (una: Hoja) => numeroDe.get(claveDe(una)) ?? indice * 2 + 2
  const paginaDeReceta = (resumen: RecetaResumen) =>
    numeroDe.get(`r:${resumen.id}`) ?? 0

  const abierta: Pagina = { hoja, receta }

  /**
   * Mientras la hoja gira, la página que todavía no ha tapado sigue
   * enseñando lo de antes.
   *
   * Sin esto, las dos caras cambiaban de contenido en el instante cero y
   * se leía la receta nueva antes de que nada se hubiera movido: la hoja
   * llegaba tarde a tapar algo que ya se había visto.
   *
   * Cuál es esa página depende del sentido, y es siempre la contraria a
   * la que la hoja levanta. Yendo hacia delante se levanta la derecha,
   * así que la izquierda es la que queda a la vista y no debe cambiar
   * hasta que la hoja caiga encima. Yendo hacia atrás, al revés.
   */
  const congelada = (lado: 'izquierda' | 'derecha'): Pagina => {
    if (!girando) return abierta
    const laQueEspera = sentido === 'adelante' ? 'izquierda' : 'derecha'
    return lado === laQueEspera ? girando : abierta
  }

  /** La cara izquierda de una hoja, sea del tipo que sea. */
  const caraIzquierda = (pagina: Pagina) =>
    pagina.hoja.tipo === 'indice' ? (
      <HojaIndiceLetra
        letra={pagina.hoja.letra}
        recetas={pagina.hoja.recetas}
        paginaDe={paginaDeReceta}
        alElegir={abrirPor}
        numero={numero(pagina.hoja)}
      />
    ) : (
      <PaginaIzquierda
        receta={pagina.receta}
        resumen={pagina.hoja.resumen}
        numero={numero(pagina.hoja)}
      />
    )

  const caraDerecha = (pagina: Pagina) =>
    pagina.hoja.tipo === 'indice' ? (
      <HojaIndiceLetraDerecha
        letra={pagina.hoja.letra}
        recetas={pagina.hoja.recetas}
        paginaDe={paginaDeReceta}
        alElegir={abrirPor}
        numero={numero(pagina.hoja) + 1}
      />
    ) : (
      <PaginaDerecha
        receta={pagina.receta}
        resumen={pagina.hoja.resumen}
        numero={numero(pagina.hoja) + 1}
      />
    )

  return (
    <div {...gestos} className={lleno ? 'libro-lleno flex h-full flex-col' : ''}>
      <div className={'libro' + (lleno ? ' flex min-h-0 flex-1 flex-col' : '')}>
        <div
          className={
            'paginas overflow-hidden' + (lleno ? ' min-h-0 flex-1' : '')
          }
        >
          <div
            // Cambiar la key reinicia las animaciones: cada hoja las
            // arranca de cero.
            key={claveDe(hoja)}
            className={
              (sentido === 'adelante' ? 'pasa-adelante' : 'pasa-atras') +
              (lleno ? ' h-full' : '')
            }
          >
            <div
              onDoubleClick={alPulsarDosVeces}
              className={'doble-pagina relative grid' + (lleno ? ' h-full' : '')}
            >
              {/* Izquierda pasa atrás, derecha adelante: se pasa hoja
                  hacia el lado que se toca, como en el papel. */}
              <div
                onClick={alPulsarHoja('atras')}
                className={
                  'solo-con-dos h-full ' +
                  (indice > 0 ? 'cursor-pointer' : 'cursor-default')
                }
              >
                {caraIzquierda(congelada('izquierda'))}
              </div>

              {/* Con una sola hoja es esta, así que lleva las dos
                  mitades una debajo de otra. */}
              <div
                onClick={alPulsarHoja('adelante')}
                className={
                  'h-full ' +
                  (indice < hojas.length - 1
                    ? 'cursor-pointer'
                    : 'cursor-default')
                }
              >
                <div className="solo-con-una">{caraIzquierda(abierta)}</div>
                {caraDerecha(abierta)}
              </div>

              {/* El pliegue entre las dos páginas. Solo cuando hay dos. */}
              <div
                aria-hidden="true"
                className="lomo solo-con-dos pointer-events-none absolute inset-y-0 left-1/2 w-10 -translate-x-1/2"
              />

              {/**
               * La hoja que pasa.
               *
               * Lleva por delante la página derecha y por detrás la
               * izquierda, que es como está hecha una hoja de verdad: lo
               * que dejas de leer y lo que aparece al otro lado.
               */}
              {girando && (
                <HojaGirando
                  sentido={sentido}
                  delante={caraDerecha(
                    sentido === 'adelante' ? girando : abierta,
                  )}
                  detras={caraIzquierda(
                    sentido === 'adelante' ? abierta : girando,
                  )}
                />
              )}

              {/* La sombra que proyecta la hoja al quedarse de canto. */}
              {girando && (
                <div aria-hidden="true" className="sombra-lomo solo-con-dos" />
              )}

              <PestanasIndice
                comienzos={comienzos}
                letraAbierta={hoja.letra}
                alElegir={irA}
              />
            </div>
          </div>
        </div>
      </div>

      <Contador indice={indice} total={hojas.length} hoja={hoja} lleno={lleno} />
    </div>
  )
}

function Contador({
  indice,
  total,
  hoja,
  lleno,
}: {
  indice: number
  total: number
  hoja: Hoja
  lleno: boolean
}) {
  return (
    <p
      role="status"
      className={
        'text-center text-sm text-tinta-suave ' + (lleno ? 'mt-3' : 'mt-6')
      }
    >
      <span className="sr-only">
        {hoja.tipo === 'receta'
          ? `Hoja abierta: ${hoja.resumen.titulo}. `
          : `Índice de la letra ${hoja.letra}. `}
      </span>
      {indice + 1} de {total}
    </p>
  )
}
