import { ListaEditable } from '../../ui/ListaEditable'
import { nuevoId } from '../formato'
import { UNIDADES_SUGERIDAS } from '../tipos'
import type { Ingrediente } from '../tipos'

interface Props {
  ingredientes: Ingrediente[]
  alCambiar: (ingredientes: Ingrediente[]) => void
}

/**
 * La medida casera va primero y a lo ancho: es la que de verdad se usa.
 * La exacta queda debajo, en pequeño, para quien quiera pesar.
 */
export function EditorIngredientes({ ingredientes, alCambiar }: Props) {
  return (
    <ListaEditable
      titulo="Ingredientes"
      ayuda="No hace falta pesar nada. «Un puñado» o «un vaso de los del vino» vale, y muchas veces es más fiel."
      items={ingredientes}
      alCambiar={alCambiar}
      nuevo={() => ({ id: nuevoId(), nombre: '' })}
      textoAñadir="Añadir ingrediente"
      fila={(ingrediente, cambiar) => (
        <div className="space-y-2">
          <input
            className="campo"
            placeholder="Harina"
            aria-label="Nombre del ingrediente"
            value={ingrediente.nombre}
            onChange={(e) => cambiar({ nombre: e.target.value })}
          />

          <input
            className="campo"
            placeholder="La que admita / un puñado / dos vasos"
            aria-label="Cantidad como se dice en casa"
            value={ingrediente.cantidadCasera ?? ''}
            onChange={(e) => cambiar({ cantidadCasera: e.target.value })}
          />

          <div className="flex gap-2">
            <input
              className="campo w-24"
              type="number"
              min="0"
              step="any"
              placeholder="250"
              aria-label="Cantidad exacta"
              value={ingrediente.cantidad ?? ''}
              onChange={(e) =>
                cambiar({
                  cantidad: e.target.value === '' ? null : Number(e.target.value),
                })
              }
            />

            <input
              className="campo flex-1"
              list="unidades-sugeridas"
              placeholder="g"
              aria-label="Unidad"
              value={ingrediente.unidad ?? ''}
              onChange={(e) => cambiar({ unidad: e.target.value })}
            />

            <input
              className="campo flex-1"
              placeholder="Grupo: para la masa"
              aria-label="Grupo del ingrediente"
              value={ingrediente.grupo ?? ''}
              onChange={(e) => cambiar({ grupo: e.target.value })}
            />
          </div>

          <input
            className="campo"
            placeholder="Nota: mejor la de la lechera"
            aria-label="Nota sobre el ingrediente"
            value={ingrediente.nota ?? ''}
            onChange={(e) => cambiar({ nota: e.target.value })}
          />
        </div>
      )}
    />
  )
}

/** Sugerencias compartidas por todos los campos de unidad. */
export function UnidadesSugeridas() {
  return (
    <datalist id="unidades-sugeridas">
      {UNIDADES_SUGERIDAS.map((unidad) => (
        <option key={unidad} value={unidad} />
      ))}
    </datalist>
  )
}
