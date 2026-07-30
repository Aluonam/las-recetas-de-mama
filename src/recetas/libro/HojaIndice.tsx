import { useMemo } from 'react'
import type { RecetaResumen } from '../tipos'
import { letraDe, tituloParaOrdenar } from '../indice/agrupar'

interface Props {
  /** Ya en el orden del libro. */
  recetas: RecetaResumen[]
  abierta: string
  alElegir: (indice: number) => void
}

/**
 * El índice, en la hoja izquierda del libro.
 *
 * Como en un recetario de casa: abres por cualquier sitio y en la página
 * de al lado tienes la lista entera para saltar a otra receta. Sin él,
 * hojear un libro de sesenta recetas para llegar a las torrijas es
 * absurdo.
 *
 * Se esconde en pantallas pequeñas: ahí solo cabe una página, y para
 * buscar ya está la vista de Índice.
 */
export function HojaIndice({ recetas, abierta, alElegir }: Props) {
  /** Se agrupa por letra conservando la posición en el libro. */
  const porLetra = useMemo(() => {
    const grupos: Array<{
      letra: string
      entradas: Array<{ receta: RecetaResumen; indice: number }>
    }> = []

    recetas.forEach((receta, indice) => {
      const letra = letraDe(receta.titulo)
      const ultimo = grupos[grupos.length - 1]
      if (ultimo && ultimo.letra === letra) ultimo.entradas.push({ receta, indice })
      else grupos.push({ letra, entradas: [{ receta, indice }] })
    })

    return grupos
  }, [recetas])

  return (
    <article className="hoja hoja-izq hidden flex-col p-6 pb-14 sm:p-8 sm:pb-16 md:flex">
      <p className="versalitas mb-1 text-center text-rosa-texto">Índice</p>
      <div className="guirnalda mb-4" aria-hidden="true" />

      {/* Con muchas recetas el índice crece; que se desplace él y no
          estire el libro entero. */}
      <nav className="min-h-0 flex-1 overflow-y-auto pr-1">
        {porLetra.map(({ letra, entradas }) => (
          <section key={letra} className="mb-4">
            <h3 className="mb-1 border-b border-borde pb-0.5 font-titulo text-lg text-verde-texto">
              {letra}
            </h3>

            <ul className="m-0 list-none p-0">
              {entradas.map(({ receta, indice }) => {
                const esta = receta.id === abierta
                return (
                  <li key={receta.id}>
                    <button
                      type="button"
                      onClick={() => alElegir(indice)}
                      aria-current={esta ? 'true' : undefined}
                      className={
                        'flex w-full items-baseline gap-1 rounded px-1 py-1 text-left transition-colors ' +
                        (esta
                          ? 'font-semibold text-rosa-texto'
                          : 'text-tinta hover:bg-superficie-2')
                      }
                    >
                      <span className="truncate">
                        {tituloParaOrdenar(receta.titulo)}
                      </span>
                      <span
                        aria-hidden="true"
                        className="mx-1 min-w-3 flex-1 translate-y-[-0.3em] border-b border-dotted border-borde"
                      />
                      <span className="shrink-0 font-titulo text-sm text-tinta-suave">
                        {indice * 2 + 2}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </nav>
    </article>
  )
}
