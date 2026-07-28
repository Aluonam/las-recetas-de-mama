import type { Ingrediente } from '../tipos'
import { agruparIngredientes, textoCantidad } from '../formato'

/** Ingredientes de la ficha, separados por grupo ("para la masa"…). */
export function ListaIngredientes({ ingredientes }: { ingredientes: Ingrediente[] }) {
  if (ingredientes.length === 0) return null

  return (
    <section>
      <h2 className="mb-3 text-2xl">Ingredientes</h2>

      {agruparIngredientes(ingredientes).map(({ grupo, items }) => (
        <div key={grupo ?? '_sin_grupo'} className="mb-4">
          {grupo && <h3 className="mb-2 text-base text-tinta-suave">{grupo}</h3>}

          <ul className="m-0 list-none space-y-2 p-0">
            {items.map((ingrediente) => {
              const cantidad = textoCantidad(ingrediente)

              return (
                <li
                  key={ingrediente.id}
                  className="border-b border-borde pb-2 last:border-0"
                >
                  <span className="font-semibold">{ingrediente.nombre}</span>
                  {cantidad && (
                    <span className="text-tinta-suave"> — {cantidad}</span>
                  )}
                  {ingrediente.nota && (
                    <span className="block text-sm text-tinta-suave">
                      {ingrediente.nota}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}
