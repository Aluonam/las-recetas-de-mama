import { useState } from 'react'
import { OCASIONES_SUGERIDAS } from '../tipos'

interface Props {
  seleccionadas: string[]
  alCambiar: (ocasiones: string[]) => void
}

/**
 * Ocasiones en las que se cocina esta receta. Sugerencias para no pensar,
 * y campo libre porque cada familia tiene las suyas.
 */
export function SelectorOcasiones({ seleccionadas, alCambiar }: Props) {
  const [propia, setPropia] = useState('')

  const alternar = (ocasion: string) => {
    alCambiar(
      seleccionadas.includes(ocasion)
        ? seleccionadas.filter((o) => o !== ocasion)
        : [...seleccionadas, ocasion],
    )
  }

  const añadirPropia = () => {
    const limpia = propia.trim()
    if (!limpia || seleccionadas.includes(limpia)) return
    alCambiar([...seleccionadas, limpia])
    setPropia('')
  }

  // Sugerencias + las que ya haya escrito la familia, sin repetir.
  const todas = [...new Set([...OCASIONES_SUGERIDAS, ...seleccionadas])]

  return (
    <fieldset className="m-0 border-0 p-0">
      {/* Sin explicación debajo: las ocasiones que hay puestas —
          Nochebuena, Verano, Enfermitos— ya dicen ellas solas de qué va
          esto, y el renglón se lo llevaba por delante. */}
      <legend className="etiqueta">¿Cuándo se hace?</legend>

      <div className="mb-3 flex flex-wrap gap-2">
        {todas.map((ocasion) => {
          const activa = seleccionadas.includes(ocasion)
          return (
            <button
              key={ocasion}
              type="button"
              onClick={() => alternar(ocasion)}
              aria-pressed={activa}
              className={
                'rounded-full border px-3 py-1.5 text-sm transition-colors ' +
                (activa
                  ? 'border-acento bg-acento text-acento-tinta'
                  : 'border-borde bg-superficie text-tinta-suave hover:bg-superficie-2')
              }
            >
              {ocasion}
            </button>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <label htmlFor="ocasion-propia" className="sr-only">
          Añadir otra ocasión
        </label>
        <input
          id="ocasion-propia"
          className="campo flex-1 sm:max-w-xs"
          placeholder="Otra ocasión…"
          value={propia}
          onChange={(e) => setPropia(e.target.value)}
          onKeyDown={(e) => {
            // Enter añade la ocasión, no envía el formulario entero.
            if (e.key === 'Enter') {
              e.preventDefault()
              añadirPropia()
            }
          }}
        />
        <button type="button" className="boton-secundario" onClick={añadirPropia}>
          Añadir
        </button>
      </div>
    </fieldset>
  )
}
