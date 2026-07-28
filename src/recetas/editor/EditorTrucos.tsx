import { ListaEditable } from '../../ui/ListaEditable'
import { nuevoId } from '../formato'
import type { Truco } from '../tipos'

interface Props {
  trucos: Truco[]
  alCambiar: (trucos: Truco[]) => void
}

/** Lo que no viene en ningún libro y solo sabe quien la ha hecho mil veces. */
export function EditorTrucos({ trucos, alCambiar }: Props) {
  return (
    <ListaEditable
      titulo="Trucos"
      ayuda="Eso que sabe quien la ha hecho mil veces y no viene en ningún libro."
      items={trucos}
      alCambiar={alCambiar}
      nuevo={() => ({ id: nuevoId(), texto: '' })}
      textoAñadir="Añadir truco"
      fila={(truco, cambiar) => (
        <div className="space-y-2">
          <textarea
            className="campo"
            rows={2}
            placeholder="No batas la masa: remuévela con cuchara de palo o se queda dura."
            aria-label="Truco"
            value={truco.texto}
            onChange={(e) => cambiar({ texto: e.target.value })}
          />
          <input
            className="campo"
            placeholder="¿Quién lo decía? La abuela"
            aria-label="Quién decía el truco"
            value={truco.deQuien ?? ''}
            onChange={(e) => cambiar({ deQuien: e.target.value })}
          />
        </div>
      )}
    />
  )
}
