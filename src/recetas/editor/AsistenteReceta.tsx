import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { RecetaEditable } from '../tipos'
import { Aviso } from '../../ui/Estado'
import { useFormularioReceta } from './useFormularioReceta'
import { SeccionPlato, SeccionEspecial, SeccionVoz } from './secciones'
import { CamposProcedencia } from './CamposProcedencia'
import { EditorIngredientes, UnidadesSugeridas } from './EditorIngredientes'
import { EditorMateriales } from './EditorMateriales'
import { EditorPasos } from './EditorPasos'
import { EditorTrucos } from './EditorTrucos'

interface Cambio {
  receta: RecetaEditable
  cambiar: (parche: Partial<RecetaEditable>) => void
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
  entradilla: string
  obligatorio?: boolean
  pintar: (props: Cambio) => React.ReactNode
}> = [
  {
    clave: 'plato',
    titulo: 'Qué plato es',
    entradilla: 'Con el nombre basta para empezar. Lo demás puede esperar.',
    obligatorio: true,
    pintar: ({ receta, cambiar }) => (
      <SeccionPlato receta={receta} cambiar={cambiar} suelto />
    ),
  },
  {
    clave: 'lleva',
    titulo: 'Qué lleva',
    entradilla:
      'No hace falta pesar nada: «un puñado» o «un vaso de los del vino» es más fiel que los gramos.',
    pintar: ({ receta, cambiar }) => (
      <div className="space-y-8">
        <EditorIngredientes
          ingredientes={receta.ingredientes}
          alCambiar={(ingredientes) => cambiar({ ingredientes })}
        />
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
    entradilla: 'Un paso por cada cosa que hay que hacer, en orden.',
    pintar: ({ receta, cambiar }) => (
      <EditorPasos
        pasos={receta.pasos}
        alCambiar={(pasos) => cambiar({ pasos })}
      />
    ),
  },
  {
    clave: 'especial',
    titulo: 'Por qué es especial',
    entradilla:
      'Esto es lo que no está en ningún libro de cocina, y lo que de verdad se pierde si nadie lo escribe.',
    pintar: ({ receta, cambiar }) => (
      <div className="space-y-8">
        <SeccionEspecial receta={receta} cambiar={cambiar} suelto />
        <CamposProcedencia
          procedencia={receta.procedencia}
          alCambiar={(procedencia) => cambiar({ procedencia })}
        />
        <EditorTrucos
          trucos={receta.trucos}
          alCambiar={(trucos) => cambiar({ trucos })}
        />
      </div>
    ),
  },
  {
    clave: 'voz',
    titulo: 'Su voz',
    entradilla: 'El último paso, y el que más vale dentro de treinta años.',
    pintar: ({ receta, cambiar }) => (
      <SeccionVoz receta={receta} cambiar={cambiar} suelto />
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

  if (!receta) return null

  const paso = PASOS[donde]
  const primero = donde === 0
  const ultimo = donde === PASOS.length - 1
  const hayNombre = receta.titulo.trim().length > 0

  const terminar = async () => {
    const id = await guardar()
    if (id) navegar(`/receta/${id}`)
  }

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
      className="mx-auto max-w-2xl"
    >
      <UnidadesSugeridas />

      <h1 className="mb-2 text-3xl sm:text-4xl">Escribir una receta</h1>

      <Guia donde={donde} hayNombre={hayNombre} alIr={ir} />

      <div className="tarjeta mt-6 p-4 sm:p-6">
        <h2 className="mb-1 text-2xl">{paso.titulo}</h2>
        <p className="mb-6 text-tinta-suave">{paso.entradilla}</p>

        {paso.pintar({ receta, cambiar })}
      </div>

      {error != null && (
        <div className="mt-6">
          <Aviso error={error} />
        </div>
      )}

      {/* Pegada abajo: en una tablet los pasos largos se van de pantalla
          y los botones tienen que seguir donde estaban. */}
      <div className="sticky bottom-0 mt-6 border-t border-borde bg-papel py-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="boton-secundario"
            onClick={() => (primero ? navegar(-1) : ir(donde - 1))}
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

          <div className="flex-1" />

          {ultimo ? (
            <button
              type="submit"
              className="boton-principal"
              disabled={!hayNombre || guardando}
            >
              {guardando ? 'Guardando…' : 'Guardar receta'}
            </button>
          ) : (
            <button
              type="submit"
              className="boton-principal"
              disabled={primero && !hayNombre}
            >
              Siguiente ›
            </button>
          )}
        </div>

        {/* Guardar sin llegar al final. Aparece en cuanto hay nombre,
            que es lo único que la receta necesita para existir. */}
        {hayNombre && !ultimo && (
          <button
            type="button"
            onClick={terminar}
            disabled={guardando}
            className="mt-3 text-sm font-semibold text-verde-texto underline transition-colors hover:text-tinta"
          >
            {guardando ? 'Guardando…' : 'Guardar y terminar ahora'}
          </button>
        )}

        {primero && !hayNombre && (
          <p className="mt-3 text-sm text-tinta-suave">
            Escribe el nombre del plato para continuar.
          </p>
        )}
      </div>
    </form>
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
                      : 'cursor-not-allowed border-borde bg-superficie text-borde')
                }
              >
                <span aria-hidden="true">{posicion + 1}. </span>
                {paso.titulo}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
