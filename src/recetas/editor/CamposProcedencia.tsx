import type { Procedencia } from '../tipos'
import { CampoArea, CampoTexto } from '../../ui/Campo'

interface Props {
  procedencia: Procedencia
  alCambiar: (procedencia: Procedencia) => void
}

/**
 * De quién viene la receta. Es la diferencia entre un recetario y un
 * archivo familiar, así que va antes que los ingredientes.
 */
export function CamposProcedencia({ procedencia, alCambiar }: Props) {
  const cambiar = (parche: Partial<Procedencia>) =>
    alCambiar({ ...procedencia, ...parche })

  return (
    <fieldset className="tarjeta m-0 space-y-4 p-4 sm:p-5">
      <legend className="px-2 font-titulo text-xl font-semibold">
        ¿De quién es esta receta?
      </legend>

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto
          etiqueta="¿Quién la hacía?"
          placeholder="La abuela Carmen"
          value={procedencia.autorNombre ?? ''}
          onChange={(e) => cambiar({ autorNombre: e.target.value })}
        />

        <CampoTexto
          etiqueta="¿Qué es tuya?"
          placeholder="Abuela"
          value={procedencia.autorRelacion ?? ''}
          onChange={(e) => cambiar({ autorRelacion: e.target.value })}
        />
      </div>

      <CampoArea
        etiqueta="¿Y ella de quién la aprendió?"
        ayuda="Aunque sea a medias. Dentro de treinta años esto vale más que la receta."
        rows={2}
        placeholder="De su madre, Josefa, en el pueblo."
        value={procedencia.aprendidaDe ?? ''}
        onChange={(e) => cambiar({ aprendidaDe: e.target.value })}
      />

      <CampoTexto
        etiqueta="¿Desde cuándo, más o menos?"
        ayuda="Un año aproximado vale. Nadie lo sabe exacto."
        type="number"
        min="1850"
        max="2100"
        placeholder="1958"
        value={procedencia.anioOrigen ?? ''}
        onChange={(e) =>
          cambiar({
            anioOrigen: e.target.value === '' ? null : Number(e.target.value),
          })
        }
      />
    </fieldset>
  )
}
