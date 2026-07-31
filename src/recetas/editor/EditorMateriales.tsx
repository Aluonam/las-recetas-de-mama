import { ListaEnTexto } from '../../ui/ListaEnTexto'
import { materialesATexto, textoAMateriales } from './listaEnTexto'
import type { Material } from '../tipos'

interface Props {
  materiales: Material[]
  alCambiar: (materiales: Material[]) => void
}

/** Los cacharros. «La cazuela de barro» a veces no es un detalle: es media receta. */
export function EditorMateriales({ materiales, alCambiar }: Props) {
  return (
    <ListaEnTexto
      etiqueta="Hace falta"
      ayuda="Uno por línea. Después de la coma, la aclaración."
      placeholder={'Cazuela de barro, la grande\nBatidora de mano'}
      valor={materialesATexto(materiales)}
      alCambiar={(texto) => alCambiar(textoAMateriales(texto))}
      minimo={3}
    />
  )
}
