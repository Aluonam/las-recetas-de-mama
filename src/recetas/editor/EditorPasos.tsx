import { ListaEditable } from '../../ui/ListaEditable'
import { nuevoId } from '../formato'
import type { Paso } from '../tipos'
import { SubirFoto } from './SubirFoto'
import { BotonDictar } from '../../ui/BotonDictar'
import { EditorAudio } from '../audio/EditorAudio'

interface Props {
  pasos: Paso[]
  alCambiar: (pasos: Paso[]) => void
}

export function EditorPasos({ pasos, alCambiar }: Props) {
  return (
    <ListaEditable
      titulo="Pasos"
      ayuda="Cuéntalo como se lo contarías a alguien que está a tu lado en la cocina."
      items={pasos}
      alCambiar={alCambiar}
      nuevo={() => ({ id: nuevoId(), texto: '' })}
      textoAñadir="Añadir paso"
      fila={(paso, cambiar) => (
        <div className="space-y-2">
          <textarea
            className="campo"
            rows={3}
            placeholder="Sofríe la cebolla a fuego lento hasta que esté transparente."
            aria-label="Texto del paso"
            value={paso.texto}
            onChange={(e) => cambiar({ texto: e.target.value })}
          />

          <BotonDictar
            valor={paso.texto}
            etiqueta="el paso"
            alCambiar={(texto) => cambiar({ texto })}
          />

          <SubirFoto
            etiqueta="Foto del paso (opcional)"
            url={paso.fotoUrl}
            alSubir={(url) => cambiar({ fotoUrl: url })}
            alQuitar={() => cambiar({ fotoUrl: null })}
          />

          {/**
           * La voz, en este paso concreto.
           *
           * Hay pasos que escritos no se entienden —«hasta que la masa
           * pida más»— y contados en diez segundos sí. Dictar convierte
           * la voz en letra; esto guarda la voz, que no es lo mismo: el
           * tono con el que se dice «sin pasarse» no cabe escrito.
           */}
          <div>
            <p className="etiqueta">Contarlo en voz alta (opcional)</p>
            <EditorAudio
              compacto
              url={paso.audioUrl}
              alGuardar={(audioUrl) => cambiar({ audioUrl })}
              alQuitar={() => cambiar({ audioUrl: null })}
            />
          </div>
        </div>
      )}
    />
  )
}
