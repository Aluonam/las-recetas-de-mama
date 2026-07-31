import { ListaEnTexto } from '../../ui/ListaEnTexto'
import { ingredientesATexto, textoAIngredientes } from './listaEnTexto'
import type { Ingrediente } from '../tipos'

interface Props {
  ingredientes: Ingrediente[]
  alCambiar: (ingredientes: Ingrediente[]) => void
}

/**
 * Los ingredientes, escritos como en un papel.
 *
 * Uno por línea, y lo de después de la coma es la cantidad. No hace
 * falta pesar: «un puñado» se guarda igual de bien que «250 g», y dice
 * más.
 */
export function EditorIngredientes({ ingredientes, alCambiar }: Props) {
  return (
    <ListaEnTexto
      etiqueta="Ingredientes"
      ayuda="Uno por línea. Después de la coma, la cantidad."
      placeholder={'Harina, 250 g\nLeche, un vaso de los del vino\nSal'}
      valor={ingredientesATexto(ingredientes)}
      alCambiar={(texto) => alCambiar(textoAIngredientes(texto))}
      minimo={6}
    />
  )
}
