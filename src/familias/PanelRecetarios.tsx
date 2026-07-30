import { useState } from 'react'
import { useFamilia } from './contexto'
import { FormularioCrear, FormularioEntrar } from './Formularios'

/**
 * Tus recetarios, y añadir otro.
 *
 * Una persona puede estar en varios: el de su casa, el de su suegra, el
 * de la yaya. Antes, una vez dentro de uno no había forma de entrar en
 * otro sin salirse, y al volver siempre se abría el mismo.
 */
export function PanelRecetarios() {
  const { familia, todas, elegir, entrar } = useFamilia()
  const [añadiendo, setAñadiendo] = useState<'no' | 'entrar' | 'crear'>('no')

  if (!familia) return null

  return (
    <section className="tarjeta p-4 sm:p-5">
      <h2 className="mb-1 text-xl">Tus recetarios</h2>
      <p className="mb-4 text-tinta-suave">
        {todas.length === 1
          ? 'Estás en uno. Puedes entrar en otro si te pasan su código.'
          : `Estás en ${todas.length}. Cambia de uno a otro cuando quieras.`}
      </p>

      <ul className="m-0 mb-4 list-none space-y-2 p-0">
        {todas.map((suya) => {
          const abierto = suya.id === familia.id
          return (
            <li key={suya.id}>
              <button
                type="button"
                onClick={() => elegir(suya.id)}
                aria-current={abierto ? 'true' : undefined}
                className={
                  'flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ' +
                  (abierto
                    ? 'border-verde-texto bg-verde-texto text-papel'
                    : 'border-borde bg-superficie hover:bg-superficie-2')
                }
              >
                <span className="flex-1 font-semibold">{suya.nombre}</span>
                {abierto && <span className="versalitas">Abierto</span>}
              </button>
            </li>
          )
        })}
      </ul>

      {añadiendo === 'no' ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="boton-secundario"
            onClick={() => setAñadiendo('entrar')}
          >
            Entrar en otro con su código
          </button>
          <button
            type="button"
            className="boton-secundario"
            onClick={() => setAñadiendo('crear')}
          >
            Crear otro recetario
          </button>
        </div>
      ) : (
        <div className="border-t border-borde pt-4">
          {añadiendo === 'entrar' ? (
            <FormularioEntrar
              alEntrar={(nueva) => {
                entrar(nueva)
                setAñadiendo('no')
              }}
            />
          ) : (
            <FormularioCrear
              alEntrar={(nueva) => {
                entrar(nueva)
                setAñadiendo('no')
              }}
            />
          )}

          <button
            type="button"
            className="boton-secundario mt-3"
            onClick={() => setAñadiendo('no')}
          >
            Cancelar
          </button>
        </div>
      )}
    </section>
  )
}
