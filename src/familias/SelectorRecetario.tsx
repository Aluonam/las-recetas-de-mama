import { useId } from 'react'
import { useFamilia } from './contexto'

/**
 * Cambiar de recetario.
 *
 * Solo aparece cuando hay más de uno. Una persona puede estar en varios
 * —el de su casa y el de su suegra— y sin esto se quedaba encerrada en el
 * primero: escribía en un recetario creyendo que estaba en el otro.
 *
 * Va en la cabecera y no escondido en Ajustes porque además de servir
 * para cambiar, sirve para saber dónde estás.
 */
export function SelectorRecetario() {
  const { familia, todas, elegir } = useFamilia()
  const id = useId()

  if (!familia || todas.length < 2) return null

  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      <label htmlFor={id} className="versalitas text-verde-texto">
        Recetario
      </label>
      <select
        id={id}
        value={familia.id}
        onChange={(evento) => elegir(evento.target.value)}
        className="rounded-lg border border-verde-texto bg-superficie px-3 py-1.5 text-sm font-semibold text-verde-texto"
      >
        {todas.map((suya) => (
          <option key={suya.id} value={suya.id}>
            {suya.nombre}
          </option>
        ))}
      </select>
    </div>
  )
}
