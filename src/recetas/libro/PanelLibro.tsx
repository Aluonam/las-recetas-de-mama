import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { RecetaResumen } from '../tipos'
import { useNavegacionLibro } from './useNavegacionLibro'
import type { Sentido } from './useNavegacionLibro'
import { useRecetaCompleta } from './useRecetaCompleta'
import { useHojaGirando } from './useHojaGirando'
import type { Pagina } from './useHojaGirando'
import { useDosPaginas } from './useDosPaginas'
import {
  claveDe,
  comienzoDeCadaLetra,
  construirHojas,
  ordenarComoLibro,
} from './hojas'
import type { Hoja } from './hojas'
import { PaginaIzquierda } from './PaginaIzquierda'
import { CaraCuerpo, CaraEnBlanco } from './CaraCuerpo'
import { bloquesDelCuerpo } from './bloquesDelCuerpo'
import type { Bloque } from './bloquesDelCuerpo'
import { useReparto } from './useReparto'
import { HojaIndiceLetra, HojaIndiceLetraDerecha } from './HojaIndiceLetra'
import { PestanasIndice } from './PestanasIndice'
import { HojaGirando } from './HojaGirando'

/** Margen para distinguir un clic suelto de los dos de abrir, en ms. */
const ESPERA_DOBLE_CLIC = 260

type Lado = 'izquierda' | 'derecha'

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

  /**
   * De par en par o de una en una.
   *
   * En apaisado el libro se abre entero y una hoja son dos caras a la
   * vez. En vertical no cabe: apretar las dos ahí daba dos columnas
   * altísimas e ilegibles, así que se pasa cara a cara, que es como se
   * lee un libro sujetándolo con una mano.
   *
   * Cambia lo que cuenta la navegación: con dos caras, las hojas; con
   * una, las caras, que son el doble.
   */
  const dos = useDosPaginas()

  const {
    indice,
    pasar: pasarHoja,
    irA,
    gestos,
  } = useNavegacionLibro(hojas.length, (haciaDonde) => pasar(haciaDonde))

  const hoja = hojas[indice]

  /**
   * UNA RECETA POR PLIEGO, Y LOS QUE HAGAN FALTA
   *
   * Una receta larga no cabe en un pliego, así que sigue en el
   * siguiente, entero. La receta de después no empieza a media hoja: se
   * espera al pliego que le toca, como en cualquier libro de cocina,
   * donde cada receta abre en su propia página.
   *
   * Cuántos pliegos son no se sabe hasta medir, así que se cuenta
   * aparte: `indice` dice por qué receta vas y `pliego`, por cuál de sus
   * pliegos. Con una sola cara, `pliego` cuenta caras en vez de pliegos.
   */
  const [pliego, setPliego] = useState(0)

  // Al cambiar de hoja se empieza por el principio de la receta.
  useEffect(() => setPliego(0), [indice])

  // Girar la tablet cambia lo que cuenta `pliego`, así que se reinicia:
  // seguir en «la cara 3» cuando ahora son pliegos no significa nada.
  useEffect(() => setPliego(0), [dos])

  const irAHoja = (destino: number) => {
    setPliego(0)
    irA(destino)
  }

  // Solo las hojas de receta necesitan traerse el cuerpo entero.
  const { receta } = useRecetaCompleta(
    hoja?.tipo === 'receta' ? hoja.resumen.id : undefined,
  )

  const bloques = useMemo(
    () => (receta ? bloquesDelCuerpo(receta) : []),
    [receta],
  )
  const claves = useMemo(() => bloques.map((uno) => uno.clave), [bloques])
  const porClave = useMemo(
    () => new Map(bloques.map((uno) => [uno.clave, uno])),
    [bloques],
  )

  const { caja, medidor, caras } = useReparto(claves)

  /**
   * Cuántas unidades navegables tiene esta hoja.
   *
   * Con el libro abierto, el primer pliego lleva la portada de la receta
   * y la primera cara del cuerpo; los siguientes llevan dos caras cada
   * uno. Con una sola cara se cuentan caras: la portada y las del
   * cuerpo, una detrás de otra.
   */
  const carasCuerpo = caras?.length ?? 1
  const subpaginas =
    hoja?.tipo !== 'receta'
      ? dos
        ? 1
        : 2
      : dos
        ? 1 + Math.ceil(Math.max(0, carasCuerpo - 1) / 2)
        : 1 + carasCuerpo

  /**
   * El sentido de la animación lo lleva esto y no la navegación.
   *
   * Dentro de una receta larga se pasa de pliego sin cambiar de hoja, y
   * la navegación no se entera de esos movimientos: si le preguntáramos
   * a ella, la hoja giraría siempre para el mismo lado.
   */
  const [sentido, setSentido] = useState<Sentido>('adelante')

  const pasar = (haciaDonde: Sentido) => {
    setSentido(haciaDonde)

    if (haciaDonde === 'adelante') {
      if (pliego < subpaginas - 1) setPliego(pliego + 1)
      else pasarHoja('adelante')
      return
    }

    if (pliego > 0) setPliego(pliego - 1)
    else pasarHoja('atras')
  }

  const girando = useHojaGirando(
    hoja ? { hoja, receta, pliego } : null,
    hoja ? `${claveDe(hoja)}:${pliego}` : null,
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
    if (destino >= 0) irAHoja(destino)
  }

  if (!hoja) return null

  const numero = (una: Hoja) => numeroDe.get(claveDe(una)) ?? indice * 2 + 2
  const paginaDeReceta = (resumen: RecetaResumen) =>
    numeroDe.get(`r:${resumen.id}`) ?? 0

  const abierta: Pagina = { hoja, receta, pliego }

  /**
   * Los bloques que van en la cara número `n` del cuerpo.
   *
   * Mientras no se ha medido va todo en la primera: es lo que se ve
   * durante el fotograma que tarda en medirse, y así lo primero que
   * aparece es el principio de la receta y no una hoja en blanco.
   */
  const caraDelCuerpo = (n: number): Bloque[] | null => {
    if (!caras) return n === 0 ? bloques : null
    const cara = caras[n]
    if (!cara) return null
    return cara.map((clave) => porClave.get(clave)!).filter(Boolean)
  }

  /** Qué cara del cuerpo toca en cada lado, según el pliego. */
  const cuerpoEn = (lado: Lado, p: number): number | null => {
    if (dos) return lado === 'derecha' ? 2 * p : p === 0 ? null : 2 * p - 1
    // Con una sola cara, la portada es la 0 y el cuerpo empieza en la 1.
    return p === 0 ? null : p - 1
  }

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
  const congelada = (lado: Lado): Pagina => {
    if (!girando) return abierta
    const laQueEspera = sentido === 'adelante' ? 'izquierda' : 'derecha'
    return lado === laQueEspera ? girando : abierta
  }

  /**
   * Una cara del libro: la que toque según la hoja, el lado y el pliego.
   *
   * En el primer pliego de una receta, la izquierda es su portada —foto
   * e ingredientes— y la derecha, el principio del cuerpo. En los
   * siguientes, las dos caras son cuerpo.
   */
  const cara = (pagina: Pagina, lado: Lado) => {
    const suNumero = numero(pagina.hoja) + (lado === 'derecha' ? 1 : 0)

    if (pagina.hoja.tipo === 'indice') {
      const Cual = lado === 'izquierda' ? HojaIndiceLetra : HojaIndiceLetraDerecha
      return (
        <Cual
          letra={pagina.hoja.letra}
          recetas={pagina.hoja.recetas}
          paginaDe={paginaDeReceta}
          alElegir={abrirPor}
          numero={suNumero}
        />
      )
    }

    const cual = cuerpoEn(lado, pagina.pliego)

    if (cual === null) {
      return (
        <PaginaIzquierda
          receta={pagina.receta}
          resumen={pagina.hoja.resumen}
          numero={suNumero}
        />
      )
    }

    const suyos = caraDelCuerpo(cual)

    // El cuerpo se acabó en la cara de enfrente: esta se queda en papel,
    // porque la receta siguiente no empieza a medio pliego.
    if (!suyos) return <CaraEnBlanco numero={suNumero} />

    const primera = cual === 0

    return (
      <CaraCuerpo
        titulo={primera ? 'Cómo se hace' : 'Sigue'}
        lado={lado}
        bloques={suyos}
        numero={suNumero}
        // Solo la primera cara mide, y solo la que se está viendo de
        // verdad: medir dentro de la hoja que gira daría la medida de
        // una hoja a medio girar.
        caja={primera && pagina === abierta ? caja : undefined}
        medidor={primera && pagina === abierta ? medidor : undefined}
        paraMedir={primera && pagina === abierta ? bloques : undefined}
      />
    )
  }

  const caraIzquierda = (pagina: Pagina) => cara(pagina, 'izquierda')
  const caraDerecha = (pagina: Pagina) => cara(pagina, 'derecha')

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
            key={`${claveDe(hoja)}:${pliego}`}
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
                  (indice > 0 || pliego > 0 ? 'cursor-pointer' : 'cursor-default')
                }
              >
                {caraIzquierda(congelada('izquierda'))}
              </div>

              {/**
               * La columna que hay siempre.
               *
               * Con dos caras es la derecha. Con una es la que toque:
               * primero el anverso de la hoja y luego el reverso, que es
               * lo que se ve al pasar páginas de una en una.
               */}
              <div
                onClick={alPulsarHoja('adelante')}
                className={
                  'h-full ' +
                  (indice < hojas.length - 1 || pliego < subpaginas - 1
                    ? 'cursor-pointer'
                    : 'cursor-default')
                }
              >
                {dos || pliego > 0
                  ? caraDerecha(abierta)
                  : caraIzquierda(abierta)}
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
                alElegir={irAHoja}
              />
            </div>
          </div>
        </div>
      </div>

      <Pie
        indice={indice}
        total={hojas.length}
        pliego={pliego}
        pliegos={subpaginas}
        hoja={hoja}
        lleno={lleno}
        alPasar={pasar}
      />
    </div>
  )
}

/**
 * Por dónde vas y, con una sola cara, cómo volver.
 *
 * Con dos caras se pasa tocando la izquierda o la derecha, así que no
 * hacen falta botones. Con una sola no hay lado que tocar para volver:
 * el dedo sirve para deslizar, pero eso hay que saberlo. Dos flechas lo
 * dicen sin que nadie lo tenga que descubrir.
 */
function Pie({
  indice,
  total,
  pliego,
  pliegos,
  hoja,
  lleno,
  alPasar,
}: {
  indice: number
  total: number
  pliego: number
  pliegos: number
  hoja: Hoja
  lleno: boolean
  alPasar: (haciaDonde: Sentido) => void
}) {
  const enElPrincipio = indice === 0 && pliego === 0
  const enElFinal = indice === total - 1 && pliego === pliegos - 1

  return (
    <div
      className={
        'flex items-center justify-center gap-4 ' + (lleno ? 'mt-3' : 'mt-6')
      }
    >
      <button
        type="button"
        onClick={() => alPasar('atras')}
        disabled={enElPrincipio}
        aria-label="Hoja anterior"
        className="boton-secundario solo-con-una size-11 p-0 text-lg"
      >
        ‹
      </button>

      <p role="status" className="m-0 text-sm text-tinta-suave">
        <span className="sr-only">
          {hoja.tipo === 'receta'
            ? `Hoja abierta: ${hoja.resumen.titulo}. `
            : `Índice de la letra ${hoja.letra}. `}
        </span>
        {indice + 1} de {total}
        {/* Solo cuando la receta ocupa más de un pliego: decirlo siempre
            sería contar hasta uno. */}
        {pliegos > 1 && (
          <span className="text-tinta-suave">
            {' '}
            · sigue {pliego + 1}/{pliegos}
          </span>
        )}
      </p>

      <button
        type="button"
        onClick={() => alPasar('adelante')}
        disabled={enElFinal}
        aria-label="Hoja siguiente"
        className="boton-secundario solo-con-una size-11 p-0 text-lg"
      >
        ›
      </button>
    </div>
  )
}
