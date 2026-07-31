import { useMemo } from 'react'
import type { RecetaResumen } from '../tipos'
import { letraDe } from '../indice/agrupar'

interface Props {
  /** Ya en el orden del libro. */
  recetas: RecetaResumen[]
  /** Posición de la receta abierta, para marcar su letra. */
  abierta: number
  alElegir: (indice: number) => void
}

/**
 * El índice, troquelado en el canto del libro.
 *
 * Como las agendas de teléfonos de toda la vida: unas lengüetas de
 * cartulina asomando por el lateral, con la letra escrita, y metes el
 * dedo por la que buscas. Antes esto ocupaba la página izquierda entera,
 * pero esa página es de la receta —no todas las hojas de un libro son el
 * índice—, así que el índice se va al borde, que es donde vive en el
 * papel.
 *
 * Solo salen las letras que tienen recetas. Un cajón vacío en una agenda
 * es un cajón, pero aquí sería un botón que no lleva a ninguna parte.
 *
 * Se esconde en pantallas pequeñas: ahí el libro es de una sola página y
 * las lengüetas se comerían el texto. Para buscar ya está la vista de
 * Índice.
 */
export function PestanasIndice({ recetas, abierta, alElegir }: Props) {
  /**
   * Una entrada por letra, apuntando a la primera receta que le toca.
   * Las recetas ya vienen ordenadas, así que la primera que aparece de
   * cada letra es por donde se abre el libro.
   */
  const letras = useMemo(() => {
    const primeras: Array<{ letra: string; indice: number }> = []

    recetas.forEach((receta, indice) => {
      const letra = letraDe(receta.titulo)
      if (primeras[primeras.length - 1]?.letra !== letra) {
        primeras.push({ letra, indice })
      }
    })

    return primeras
  }, [recetas])

  const letraAbierta = recetas[abierta]
    ? letraDe(recetas[abierta].titulo)
    : null

  if (letras.length < 2) return null

  return (
    <nav
      aria-label="Índice del recetario"
      className="pestanas hidden md:flex"
    >
      {letras.map(({ letra, indice }) => {
        const esta = letra === letraAbierta
        return (
          <button
            key={letra}
            type="button"
            onClick={() => alElegir(indice)}
            aria-current={esta ? 'true' : undefined}
            title={`Ir a la ${letra}`}
            className={'pestana' + (esta ? ' pestana-abierta' : '')}
          >
            {letra}
          </button>
        )
      })}
    </nav>
  )
}
