import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Apartado, RecetaEditable } from '../tipos'
import { AudiosApartado } from '../audio/AudiosApartado'
import { Aviso } from '../../ui/Estado'
import { useFormularioReceta } from './useFormularioReceta'
import { useAvisoAlSalir } from './useAvisoAlSalir'
import { Confirmar } from '../../ui/Confirmar'
import {
  borrarBorrador,
  guardarBorrador,
  leerBorrador,
  tieneAlgo,
} from './borrador'
import { SeccionPlato, SeccionEspecial, SeccionVoz } from './secciones'
import { CamposProcedencia } from './CamposProcedencia'
import { EditorIngredientes } from './EditorIngredientes'
import { EditorMateriales } from './EditorMateriales'
import { EditorPasos } from './EditorPasos'
import { EditorTrucos } from './EditorTrucos'

interface Cambio {
  receta: RecetaEditable
  cambiar: (parche: Partial<RecetaEditable>) => void
}

/**
 * Las notas de voz de un apartado, enganchadas al mismo estado que todo
 * lo demás. Va en su propio envoltorio para no repetir el `cambiar` en
 * los cinco sitios donde aparece.
 */
function Voz({
  apartado,
  receta,
  cambiar,
}: Cambio & { apartado: Apartado }) {
  return (
    <AudiosApartado
      apartado={apartado}
      audios={receta.audios}
      alCambiar={(audios) => cambiar({ audios })}
    />
  )
}

/**
 * Los pasos, en el orden en que se cuenta una receta.
 *
 * No están agrupados por parecido técnico sino por lo que tienes en la
 * cabeza en ese momento: primero qué plato es, luego qué lleva, luego
 * cómo se hace, y al final lo que no cabe en ninguna de las tres.
 *
 * Solo el primero es obligatorio, y de él solo el nombre. Los demás se
 * pueden saltar: una receta a medias es una receta, y media receta
 * guardada vale más que una entera que nadie escribió porque el
 * formulario pedía demasiado.
 */
const PASOS: Array<{
  clave: string
  titulo: string
  obligatorio?: boolean
  pintar: (props: Cambio) => React.ReactNode
}> = [
  {
    clave: 'plato',
    titulo: 'Qué plato es',
    obligatorio: true,
    pintar: ({ receta, cambiar }) => (
      <SeccionPlato receta={receta} cambiar={cambiar} />
    ),
  },
  {
    clave: 'lleva',
    titulo: 'Qué lleva',
    pintar: ({ receta, cambiar }) => (
      <div className="space-y-8">
        <div>
          <EditorIngredientes
            ingredientes={receta.ingredientes}
            alCambiar={(ingredientes) => cambiar({ ingredientes })}
          />
          <Voz apartado="ingredientes" receta={receta} cambiar={cambiar} />
        </div>
        <EditorMateriales
          materiales={receta.materiales}
          alCambiar={(materiales) => cambiar({ materiales })}
        />
      </div>
    ),
  },
  {
    clave: 'hace',
    titulo: 'Cómo se hace',
    // Los trucos van aquí, pegados a los pasos: son parte de cómo se
    // hace. Estaban con el recuerdo y la procedencia, que es de dónde
    // viene la receta, y son cosas distintas —uno se lee cocinando y lo
    // otro se lee para saber de quién era.
    pintar: ({ receta, cambiar }) => (
      <div className="space-y-8">
        <div>
          <EditorPasos
            pasos={receta.pasos}
            alCambiar={(pasos) => cambiar({ pasos })}
          />
          <Voz apartado="pasos" receta={receta} cambiar={cambiar} />
        </div>
        <div>
          <EditorTrucos
            trucos={receta.trucos}
            alCambiar={(trucos) => cambiar({ trucos })}
          />
          <Voz apartado="trucos" receta={receta} cambiar={cambiar} />
        </div>
      </div>
    ),
  },
  {
    clave: 'especial',
    titulo: 'Por qué es especial',
    pintar: ({ receta, cambiar }) => (
      <div className="space-y-8">
        <div>
          <SeccionEspecial receta={receta} cambiar={cambiar} />
          <Voz apartado="especial" receta={receta} cambiar={cambiar} />
        </div>
        <div>
          <CamposProcedencia
            procedencia={receta.procedencia}
            alCambiar={(procedencia) => cambiar({ procedencia })}
          />
          <Voz apartado="procedencia" receta={receta} cambiar={cambiar} />
        </div>
      </div>
    ),
  },
  {
    clave: 'voz',
    titulo: 'Su voz',
    pintar: ({ receta, cambiar }) => (
      <SeccionVoz receta={receta} cambiar={cambiar} />
    ),
  },
]

/**
 * Escribir una receta, de un paso en un paso.
 *
 * La página larga tenía veinte campos a la vista y sesenta casillas si
 * la receta llevaba doce ingredientes. Eso no se rellena: se cierra. Aquí
 * cada pantalla pide una sola cosa.
 *
 * Se puede ir y volver por donde se quiera, tanto con los botones como
 * pulsando el nombre de un paso arriba, porque escribir una receta no es
 * un trámite en orden: te acuerdas del truco de la abuela mientras estás
 * poniendo los ingredientes.
 *
 * Y se puede guardar en cualquier momento, en cuanto hay nombre. Si a
 * medias suena el teléfono, la receta ya existe.
 */
export function AsistenteReceta() {
  const navegar = useNavigate()
  const { receta, cambiar, guardar, guardando, error } = useFormularioReceta()
  const [donde, setDonde] = useState(0)

  /**
   * Lo que quedó a medias la última vez, esperando respuesta.
   *
   * Se lee una sola vez, al abrir. Mientras esté aquí no se guarda nada
   * encima: si el asistente empezara a escribir su borrador en blanco
   * antes de que nadie conteste, se cargaría justo lo que viene a
   * rescatar.
   */
  const [pendiente, setPendiente] = useState(() => leerBorrador())

  const hayAlgo = receta != null && tieneAlgo(receta)
  const [terminado, setTerminado] = useState(false)
  const [saliendo, setSaliendo] = useState(false)

  /** Se guarda solo, un poco después de dejar de escribir. */
  useEffect(() => {
    if (!receta || pendiente || terminado || !tieneAlgo(receta)) return

    const reloj = window.setTimeout(() => guardarBorrador(receta), 600)
    return () => window.clearTimeout(reloj)
  }, [receta, pendiente, terminado])

  // La última red, para cuando no hay dónde guardar el borrador.
  useAvisoAlSalir(hayAlgo && !terminado)

  if (!receta) return null

  const paso = PASOS[donde]
  const primero = donde === 0
  const ultimo = donde === PASOS.length - 1
  const hayNombre = receta.titulo.trim().length > 0

  const terminar = async () => {
    const id = await guardar()
    if (!id) return

    // Ya está a salvo en el recetario: el borrador sobra.
    setTerminado(true)
    borrarBorrador()
    navegar(`/receta/${id}`)
  }

  /**
   * Al salir con algo escrito se pregunta, pero no se borra nada: queda
   * de borrador y al volver se ofrece. «Cancelar» no debería significar
   * «tira lo que llevas» cuando se puede significar «déjalo para luego».
   */
  const salir = () => (hayAlgo ? setSaliendo(true) : navegar(-1))

  const ir = (destino: number) =>
    setDonde(Math.min(Math.max(destino, 0), PASOS.length - 1))

  return (
    <form
      onSubmit={(evento) => {
        evento.preventDefault()
        // Enter dentro de un campo no debe guardar a medio asistente:
        // avanza, que es lo que espera quien está escribiendo.
        if (ultimo) terminar()
        else ir(donde + 1)
      }}
      // Más ancho que antes: con la tarjeta estrecha, las ocasiones
      // —ocho botones— se partían en dos filas y las hacían parecer dos
      // grupos distintos. Cabiendo de una tirada se leen de un vistazo.
      className="mx-auto max-w-4xl"
    >

      <h1 className="mb-2 text-3xl sm:text-4xl">Escribir una receta</h1>

      {pendiente && (
        <Rescate
          borrador={pendiente}
          alSeguir={() => {
            cambiar(pendiente)
            setPendiente(null)
          }}
          alDejarlo={() => {
            borrarBorrador()
            setPendiente(null)
          }}
        />
      )}

      {saliendo && (
        <Confirmar
          titulo="¿Dejar la receta a medias?"
          detalle="Se guarda como borrador en este aparato, así que podrás seguir con ella cuando vuelvas."
          textoSi="Sí, dejarla para luego"
          textoNo="No, seguir escribiendo"
          alSi={() => navegar(-1)}
          alNo={() => setSaliendo(false)}
        />
      )}

      <Guia donde={donde} hayNombre={hayNombre} alIr={ir} />

      <div className="mt-6">{paso.pintar({ receta, cambiar })}</div>

      {error != null && (
        <div className="mt-6">
          <Aviso error={error} />
        </div>
      )}

      {/* Pegada abajo: en una tablet los pasos largos se van de pantalla
          y los botones tienen que seguir donde estaban. */}
      <div className="sticky bottom-0 z-10 mt-6 border-t border-borde bg-papel py-4">
        {/**
         * Dos grupos, no una fila suelta de botones.
         *
         * Antes iban todos al mismo nivel con un hueco elástico en
         * medio, y al escribir el nombre aparecía «Guardar y terminar»:
         * la fila ya no cabía, se partía en dos renglones, y como esta
         * barra está pegada al borde de abajo, el segundo renglón se
         * salía de la pantalla y solo se veía su mitad de arriba.
         *
         * Agrupados, cuando no caben bajan los dos juntos y se ven
         * enteros.
         */}
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="boton-secundario"
              onClick={() => (primero ? salir() : ir(donde - 1))}
            >
              {primero ? 'Cancelar' : '‹ Atrás'}
            </button>

            {/* Saltar solo donde hay algo que saltarse. El primero pide el
                nombre, y sin nombre no hay receta. */}
            {!paso.obligatorio && !ultimo && (
              <button
                type="button"
                className="rounded-md px-3 py-2 text-sm font-semibold text-tinta-suave underline transition-colors hover:text-tinta"
                onClick={() => ir(donde + 1)}
              >
                Saltar este paso
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/**
             * Terminar sin llegar al final, al lado de «Siguiente» y con
             * el mismo peso.
             *
             * Estaba de enlace subrayado y en letra pequeña, debajo, y
             * es justo la salida que necesita quien se cansa a la mitad
             * o le suena el teléfono. Escondida no la encuentra, y
             * entonces la receta se queda sin guardar por no saber que
             * se podía.
             */}
            {!ultimo && (
              <button
                type="button"
                className="boton-secundario whitespace-nowrap"
                onClick={terminar}
                // Apagado hasta que hay nombre, pero puesto desde el
                // principio: apareciendo de golpe le cambiaba el alto a
                // esta barra, que va pegada al borde de abajo, y el
                // navegador no la volvía a pintar entera —se quedaba
                // media mitad del botón sin dibujar—. Además así se sabe
                // desde el primer momento que se puede salir guardando.
                disabled={!hayNombre || guardando}
              >
                {guardando ? 'Guardando…' : 'Guardar y terminar'}
              </button>
            )}

            {ultimo ? (
              <button
                type="submit"
                className="boton-principal whitespace-nowrap"
                disabled={!hayNombre || guardando}
              >
                {guardando ? 'Guardando…' : 'Guardar receta'}
              </button>
            ) : (
              <button
                type="submit"
                className="boton-principal whitespace-nowrap"
                disabled={primero && !hayNombre}
              >
                Siguiente ›
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}

/**
 * «Tenías una receta a medias.»
 *
 * Sale antes que nada y con las dos salidas a la vista, porque quien
 * abre esto viene a escribir: si la única opción visible fuera seguir
 * con lo de antes, quien quiere empezar otra se quedaría atascado.
 *
 * Se dice el nombre si lo tiene. «Tenías una receta a medias» no le
 * dice nada a nadie; «tenías a medias las croquetas de la abuela» se
 * reconoce al momento.
 */
function Rescate({
  borrador,
  alSeguir,
  alDejarlo,
}: {
  borrador: RecetaEditable
  alSeguir: () => void
  alDejarlo: () => void
}) {
  const nombre = borrador.titulo.trim()

  return (
    <div className="mb-6 rounded-lg border-2 border-rosa-medio bg-superficie p-4">
      <p className="mb-3">
        {nombre ? (
          <>
            Tenías a medias <strong>«{nombre}»</strong>. ¿Sigues con ella?
          </>
        ) : (
          <>Tenías una receta empezada, todavía sin nombre. ¿Sigues con ella?</>
        )}
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="boton-principal" onClick={alSeguir}>
          Sí, seguir con ella
        </button>
        <button type="button" className="boton-secundario" onClick={alDejarlo}>
          No, empezar una nueva
        </button>
      </div>
    </div>
  )
}

/**
 * Por dónde vas, y el atajo para saltar a otro paso.
 *
 * Es lo que convierte el asistente en algo por lo que se puede pasear en
 * vez de un pasillo de sentido único: si estás en los ingredientes y te
 * acuerdas del truco de la abuela, vas, lo escribes y vuelves.
 *
 * Los pasos se bloquean mientras no haya nombre. No es por rigor: sin
 * nombre no se puede guardar, y dejar rellenar media receta para
 * descubrirlo al final sería peor.
 */
function Guia({
  donde,
  hayNombre,
  alIr,
}: {
  donde: number
  hayNombre: boolean
  alIr: (destino: number) => void
}) {
  return (
    <div>
      <p className="mb-3 versalitas text-tinta-suave">
        Paso {donde + 1} de {PASOS.length}
      </p>

      <ol className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {PASOS.map((paso, posicion) => {
          const aqui = posicion === donde
          const alcanzable = hayNombre || posicion === 0

          return (
            <li key={paso.clave}>
              <button
                type="button"
                disabled={!alcanzable}
                onClick={() => alIr(posicion)}
                aria-current={aqui ? 'step' : undefined}
                className={
                  'rounded-full border px-3 py-1.5 text-sm transition-colors ' +
                  (aqui
                    ? 'border-verde-texto bg-verde-texto font-semibold text-papel'
                    : alcanzable
                      ? 'border-borde bg-superficie text-tinta-suave hover:bg-superficie-2'
                      : // Apagado, no borrado. Antes iba en el color del
                        // borde, que sobre el papel de la web da 1,4 de
                        // contraste: eso no es texto gris, es texto que no
                        // está, y quedaba una fila de botones vacíos.
                        'cursor-not-allowed border-borde bg-superficie text-tinta-suave opacity-60')
                }
              >
                <span aria-hidden="true">{posicion + 1}. </span>
                {paso.titulo}
              </button>
            </li>
          )
        })}
      </ol>

      {/* El aviso, aquí y no al final de la página: explica por qué esos
          botones no se pueden pulsar, y esa explicación tiene que estar
          donde están ellos. Abajo del todo no la leía nadie. */}
      {!hayNombre && (
        <p role="status" className="mt-2 text-sm text-tinta-suave">
          Escribe el nombre del plato para poder ir a los demás pasos.
        </p>
      )}
    </div>
  )
}
