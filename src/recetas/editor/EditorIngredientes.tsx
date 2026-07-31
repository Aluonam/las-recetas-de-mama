import { nuevoId } from '../formato'
import { MEDIDAS_SUGERIDAS } from '../tipos'
import type { Ingrediente } from '../tipos'

interface Props {
  ingredientes: Ingrediente[]
  alCambiar: (ingredientes: Ingrediente[]) => void
}

/**
 * Los ingredientes, uno por línea, con la medida en un desplegable.
 *
 * Se probó a escribirlos de una tirada en un solo cuadro y se leía bien,
 * pero cada línea había que interpretarla —dónde acaba el nombre, si lo
 * de después es un número o «un puñado»— y eso se equivoca. Con tres
 * casillas no hay nada que adivinar, y la medida elegida de una lista
 * evita que la misma cosa acabe escrita «cucharada», «cda» y «Cuchda».
 *
 * Las tres últimas medidas —al gusto, la que admita— van sin número. Por
 * eso la cantidad no es obligatoria: «sal, al gusto» ya está completo.
 */
export function EditorIngredientes({ ingredientes, alCambiar }: Props) {
  const cambiar = (indice: number, parche: Partial<Ingrediente>) =>
    alCambiar(
      ingredientes.map((ingrediente, i) =>
        i === indice ? { ...ingrediente, ...parche } : ingrediente,
      ),
    )

  const quitar = (indice: number) =>
    alCambiar(ingredientes.filter((_, i) => i !== indice))

  const mover = (indice: number, salto: -1 | 1) => {
    const destino = indice + salto
    if (destino < 0 || destino >= ingredientes.length) return
    const copia = [...ingredientes]
    ;[copia[indice], copia[destino]] = [copia[destino], copia[indice]]
    alCambiar(copia)
  }

  return (
    <fieldset className="tarjeta m-0 p-4 sm:p-5">
      <legend className="px-2 font-titulo text-xl font-semibold">
        Ingredientes
      </legend>
      <p className="mb-4 text-sm text-tinta-suave">
        No hace falta pesar: «un puñado» o «un vaso» también son medidas.
      </p>

      {/* Los rótulos, una sola vez arriba. Repetirlos en cada fila
          llenaría la pantalla de letra pequeña; en móvil no caben las
          tres columnas y ahí hablan los textos de dentro. */}
      {ingredientes.length > 0 && (
        <div className="mb-1 hidden gap-2 px-1 sm:flex">
          <span className="versalitas flex-1 text-tinta-suave">Producto</span>
          <span className="versalitas w-36 text-tinta-suave">Medida</span>
          <span className="versalitas w-24 text-tinta-suave">Cantidad</span>
          <span className="w-[6.5rem]" />
        </div>
      )}

      <ul className="m-0 list-none space-y-2 p-0">
        {ingredientes.map((ingrediente, indice) => (
          <li key={ingrediente.id} className="flex flex-wrap items-center gap-2">
            <input
              className="campo min-w-[10rem] flex-1"
              placeholder="Harina"
              aria-label={`Producto del ingrediente ${indice + 1}`}
              value={ingrediente.nombre}
              onChange={(e) => cambiar(indice, { nombre: e.target.value })}
            />

            <Medida
              ingrediente={ingrediente}
              indice={indice}
              alCambiar={(parche) => cambiar(indice, parche)}
            />

            <input
              className="campo w-24"
              type="number"
              min="0"
              step="any"
              placeholder="250"
              aria-label={`Cantidad del ingrediente ${indice + 1}`}
              value={ingrediente.cantidad ?? ''}
              onChange={(e) =>
                cambiar(indice, {
                  cantidad: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />

            <div className="flex gap-1">
              <BotonFila
                onClick={() => mover(indice, -1)}
                disabled={indice === 0}
                etiqueta={`Subir el ingrediente ${indice + 1}`}
              >
                ↑
              </BotonFila>
              <BotonFila
                onClick={() => mover(indice, 1)}
                disabled={indice === ingredientes.length - 1}
                etiqueta={`Bajar el ingrediente ${indice + 1}`}
              >
                ↓
              </BotonFila>
              <BotonFila
                onClick={() => quitar(indice)}
                etiqueta={`Quitar el ingrediente ${indice + 1}`}
              >
                ✕
              </BotonFila>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="boton-secundario mt-4 w-full sm:w-auto"
        onClick={() => alCambiar([...ingredientes, { id: nuevoId(), nombre: '' }])}
      >
        Añadir ingrediente
      </button>
    </fieldset>
  )
}

/**
 * El desplegable de la medida.
 *
 * Antes esto se escribía a mano y admitía cualquier cosa, así que hay
 * recetas guardadas con «un vaso de los del vino» donde ahora va la
 * lista. Lo que no esté en ella se añade como una opción más: un
 * desplegable que no encuentra su valor se enseña en blanco, y al
 * guardar habría borrado en silencio lo que alguien escribió.
 */
function Medida({
  ingrediente,
  indice,
  alCambiar,
}: {
  ingrediente: Ingrediente
  indice: number
  alCambiar: (parche: Partial<Ingrediente>) => void
}) {
  const puesta = ingrediente.unidad ?? ingrediente.cantidadCasera ?? ''
  const aMano =
    puesta && !MEDIDAS_SUGERIDAS.some((medida) => medida === puesta)

  return (
    <select
      className="campo w-36"
      aria-label={`Medida del ingrediente ${indice + 1}`}
      value={puesta}
      onChange={(e) =>
        // La medida de casa pasa a la lista, así que se limpia: si no,
        // la receta enseñaría las dos, «un puñado (2 cucharadas)».
        alCambiar({ unidad: e.target.value || null, cantidadCasera: null })
      }
    >
      <option value="">Sin medida</option>
      {aMano && <option value={puesta}>{puesta}</option>}
      {MEDIDAS_SUGERIDAS.map((medida) => (
        <option key={medida} value={medida}>
          {medida}
        </option>
      ))}
    </select>
  )
}

function BotonFila({
  onClick,
  disabled,
  etiqueta,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  etiqueta: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={etiqueta}
      // min-h-11: objetivo táctil cómodo en móvil (WCAG 2.5.5).
      className="boton-secundario min-h-11 min-w-11 px-2 py-1 text-sm"
    >
      {children}
    </button>
  )
}
