import { ListaEnTexto } from '../../ui/ListaEnTexto'
import { textoATrucos, trucosATexto } from './listaEnTexto'
import type { Truco } from '../tipos'

interface Props {
  trucos: Truco[]
  alCambiar: (trucos: Truco[]) => void
}

/**
 * Los trucos, en un cuadro ya abierto y con marco de aviso.
 *
 * Va destacado porque es lo que de verdad se pierde. Los ingredientes de
 * unas croquetas están en cualquier libro; que la masa se remueve con
 * cuchara de palo o se queda dura, solo lo sabe quien las ha hecho mil
 * veces, y no lo cuenta si nadie se lo pregunta.
 *
 * Una línea por truco, sin partir por comas: son frases enteras y «Si se
 * corta, un chorrito de agua fría» se quedaría a la mitad.
 */
export function EditorTrucos({ trucos, alCambiar }: Props) {
  return (
    <ListaEnTexto
      destacado
      etiqueta="Los trucos de la casa"
      ayuda="Lo más importante de la receta: eso que sabe quien la ha hecho mil veces y no viene en ningún libro. Uno por línea."
      placeholder={
        'No batas la masa: remuévela con cuchara de palo o se queda dura.\n' +
        'Si se corta, un chorrito de agua fría y a batir otra vez.'
      }
      valor={trucosATexto(trucos)}
      alCambiar={(texto) => alCambiar(textoATrucos(texto, trucos))}
      minimo={4}
    />
  )
}
