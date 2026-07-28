import type { ReactNode } from 'react'

interface Props<T extends { id: string }> {
  titulo: string
  ayuda?: string
  items: T[]
  alCambiar: (items: T[]) => void
  /** Cómo se crea una fila vacía. */
  nuevo: () => T
  textoAñadir: string
  /** Campos de una fila. `cambiar` aplica un parche sobre ese elemento. */
  fila: (item: T, cambiar: (parche: Partial<T>) => void) => ReactNode
}

/**
 * Lista con añadir, quitar y reordenar.
 *
 * Ingredientes, materiales, pasos y trucos se comportan igual; lo único que
 * cambia son los campos de cada fila, que llegan por `fila`. Una sola
 * implementación del comportamiento y cuatro editores tontos encima.
 */
export function ListaEditable<T extends { id: string }>({
  titulo,
  ayuda,
  items,
  alCambiar,
  nuevo,
  textoAñadir,
  fila,
}: Props<T>) {
  const cambiarItem = (indice: number, parche: Partial<T>) =>
    alCambiar(items.map((item, i) => (i === indice ? { ...item, ...parche } : item)))

  const quitar = (indice: number) =>
    alCambiar(items.filter((_, i) => i !== indice))

  const mover = (indice: number, salto: -1 | 1) => {
    const destino = indice + salto
    if (destino < 0 || destino >= items.length) return
    const copia = [...items]
    ;[copia[indice], copia[destino]] = [copia[destino], copia[indice]]
    alCambiar(copia)
  }

  const singular = titulo.toLowerCase()

  return (
    <fieldset className="tarjeta m-0 p-4 sm:p-5">
      <legend className="px-2 font-titulo text-xl font-semibold">{titulo}</legend>
      {ayuda && <p className="mb-4 text-sm text-tinta-suave">{ayuda}</p>}

      <ul className="m-0 list-none space-y-4 p-0">
        {items.map((item, indice) => (
          <li key={item.id} className="rounded-lg border border-borde bg-papel p-3">
            <div className="mb-2 flex items-center gap-1">
              <span className="text-sm font-semibold text-tinta-suave">
                {indice + 1}
              </span>

              <div className="ml-auto flex gap-1">
                <BotonFila
                  onClick={() => mover(indice, -1)}
                  disabled={indice === 0}
                  etiqueta={`Subir ${singular} ${indice + 1}`}
                >
                  ↑
                </BotonFila>
                <BotonFila
                  onClick={() => mover(indice, 1)}
                  disabled={indice === items.length - 1}
                  etiqueta={`Bajar ${singular} ${indice + 1}`}
                >
                  ↓
                </BotonFila>
                <BotonFila
                  onClick={() => quitar(indice)}
                  etiqueta={`Quitar ${singular} ${indice + 1}`}
                >
                  Quitar
                </BotonFila>
              </div>
            </div>

            {fila(item, (parche) => cambiarItem(indice, parche))}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="boton-secundario mt-4 w-full sm:w-auto"
        onClick={() => alCambiar([...items, nuevo()])}
      >
        {textoAñadir}
      </button>
    </fieldset>
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
  children: ReactNode
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
