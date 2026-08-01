import type { ReactNode } from 'react'
import type { Receta } from '../tipos'

/**
 * Un trozo del cuerpo de la receta que no se parte por la mitad.
 *
 * Un paso entero, un truco entero, el porqué entero. Se reparten entre
 * las caras que hagan falta, pero ninguno se corta: media frase al final
 * de una hoja y la otra media al principio de la siguiente es lo que
 * hace un procesador de textos, no un libro de cocina.
 */
export interface Bloque {
  clave: string
  nodo: ReactNode
}

/**
 * El cuerpo de la receta, en bloques y en orden.
 *
 * Primero el porqué —que es lo que engancha—, luego los pasos, y al
 * final los trucos, que son lo que se lee cuando ya sabes lo que estás
 * haciendo.
 *
 * Los pasos llevan su número escrito y no una lista numerada, porque una
 * lista repartida entre tres caras tendría que empezar a contar de nuevo
 * en cada una o llevar la cuenta a mano de todos modos.
 */
export function bloquesDelCuerpo(receta: Receta): Bloque[] {
  const bloques: Bloque[] = []

  if (receta.porQueEspecial?.trim()) {
    bloques.push({
      clave: 'especial',
      nodo: (
        <p className="border-l-4 border-rosa-medio pl-4 font-titulo italic">
          {receta.porQueEspecial}
        </p>
      ),
    })
  }

  receta.pasos.forEach((paso, orden) => {
    bloques.push({
      clave: `paso-${paso.id}`,
      nodo: (
        <div className="flex gap-3">
          <span
            aria-hidden="true"
            className="shrink-0 font-titulo text-lg text-rosa-texto"
          >
            {orden + 1}.
          </span>
          <span>{paso.texto}</span>
        </div>
      ),
    })
  })

  if (receta.pasos.length === 0) {
    bloques.push({
      clave: 'sin-pasos',
      nodo: <p className="py-6 text-center italic text-tinta-suave">(vacío)</p>,
    })
  }

  if (receta.trucos.length > 0) {
    bloques.push({
      clave: 'trucos-titulo',
      nodo: (
        <h3 className="versalitas pt-2 text-center text-tinta-suave">
          El truco de la casa
        </h3>
      ),
    })

    for (const truco of receta.trucos) {
      bloques.push({
        clave: `truco-${truco.id}`,
        nodo: (
          <p className="text-tinta-suave">
            {truco.texto}
            {truco.deQuien && (
              <span className="block font-titulo italic">— {truco.deQuien}</span>
            )}
          </p>
        ),
      })
    }
  }

  return bloques
}
