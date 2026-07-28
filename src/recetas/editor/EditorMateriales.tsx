import { ListaEditable } from '../../ui/ListaEditable'
import { nuevoId } from '../formato'
import type { Material } from '../tipos'

interface Props {
  materiales: Material[]
  alCambiar: (materiales: Material[]) => void
}

export function EditorMateriales({ materiales, alCambiar }: Props) {
  return (
    <ListaEditable
      titulo="Materiales"
      ayuda="Los cacharros. «La cazuela de barro» no es un detalle: a veces es media receta."
      items={materiales}
      alCambiar={alCambiar}
      nuevo={() => ({ id: nuevoId(), nombre: '' })}
      textoAñadir="Añadir material"
      fila={(material, cambiar) => (
        <div className="space-y-2">
          <input
            className="campo"
            placeholder="Cazuela de barro"
            aria-label="Nombre del material"
            value={material.nombre}
            onChange={(e) => cambiar({ nombre: e.target.value })}
          />
          <input
            className="campo"
            placeholder="Nota: la grande, la que está arriba"
            aria-label="Nota sobre el material"
            value={material.nota ?? ''}
            onChange={(e) => cambiar({ nota: e.target.value })}
          />
        </div>
      )}
    />
  )
}
