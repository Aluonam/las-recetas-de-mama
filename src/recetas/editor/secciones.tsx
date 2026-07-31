import type { RecetaEditable } from '../tipos'
import { CampoArea, CampoTexto } from '../../ui/Campo'
import { SelectorOcasiones } from './SelectorOcasiones'
import { SubirFoto } from './SubirFoto'
import { EditorAudio } from '../audio/EditorAudio'

/**
 * Los bloques de campos de una receta.
 *
 * Viven aquí y no en la página porque hay dos maneras de rellenarlos:
 * el asistente los va enseñando de uno en uno al escribir una receta
 * nueva, y la página larga los enseña todos juntos al editar una que ya
 * existe. Los campos son los mismos; lo que cambia es cuántos ves a la
 * vez.
 */
export interface Props {
  receta: RecetaEditable
  cambiar: (parche: Partial<RecetaEditable>) => void
  /**
   * En la página larga cada bloque va en su tarjeta con su título. En el
   * asistente el título ya lo pone el propio paso, y repetirlo sobraba.
   */
  suelto?: boolean
}

/** Envoltorio común: tarjeta con leyenda, o nada. */
function Bloque({
  titulo,
  suelto,
  children,
}: {
  titulo: string
  suelto?: boolean
  children: React.ReactNode
}) {
  if (suelto) return <div className="space-y-4">{children}</div>

  return (
    <fieldset className="tarjeta m-0 space-y-4 p-4 sm:p-5">
      <legend className="px-2 font-titulo text-xl font-semibold">
        {titulo}
      </legend>
      {children}
    </fieldset>
  )
}

export function SeccionPlato({ receta, cambiar, suelto }: Props) {
  return (
    <Bloque titulo="La receta" suelto={suelto}>
      <CampoTexto
        etiqueta="¿Cómo se llama?"
        required
        placeholder="Croquetas de la abuela"
        value={receta.titulo}
        onChange={(e) => cambiar({ titulo: e.target.value })}
      />

      <CampoTexto
        etiqueta="Una línea para reconocerla"
        placeholder="Las de siempre, las de los domingos."
        value={receta.descripcion ?? ''}
        onChange={(e) => cambiar({ descripcion: e.target.value })}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto
          etiqueta="¿Para cuántos?"
          ayuda="Como se diga en casa."
          placeholder="Para 6, o para 4 si viene el tío"
          value={receta.raciones ?? ''}
          onChange={(e) => cambiar({ raciones: e.target.value })}
        />

        <CampoTexto
          etiqueta="Tiempo (minutos)"
          type="number"
          min="1"
          placeholder="90"
          value={receta.tiempoMinutos ?? ''}
          onChange={(e) =>
            cambiar({
              tiempoMinutos:
                e.target.value === '' ? null : Number(e.target.value),
            })
          }
        />
      </div>

      <SelectorOcasiones
        seleccionadas={receta.ocasiones}
        alCambiar={(ocasiones) => cambiar({ ocasiones })}
      />

      <SubirFoto
        etiqueta="Foto de portada"
        url={receta.fotoPortadaUrl}
        alSubir={(url) => cambiar({ fotoPortadaUrl: url })}
        alQuitar={() => cambiar({ fotoPortadaUrl: null })}
      />
    </Bloque>
  )
}

export function SeccionEspecial({ receta, cambiar, suelto }: Props) {
  return (
    <Bloque titulo="¿Qué hace especial a esta receta?" suelto={suelto}>
      <CampoArea
        etiqueta="Cuéntalo"
        ayuda="La historia, el recuerdo, por qué esta y no otra. Este campo es el que hace que valga la pena guardarla."
        rows={5}
        placeholder="Es lo primero que olía la casa cuando llegábamos en Navidad. La abuela empezaba el día antes y no dejaba entrar a nadie en la cocina."
        value={receta.porQueEspecial ?? ''}
        onChange={(e) => cambiar({ porQueEspecial: e.target.value })}
      />
    </Bloque>
  )
}

export function SeccionVoz({ receta, cambiar, suelto }: Props) {
  return (
    <Bloque titulo="Contada con su voz" suelto={suelto}>
      <p className="text-sm text-tinta-suave">
        Grábala mientras la cuenta, o sube esa nota de voz que ya tienes
        guardada. Es lo único de una receta que no se puede reconstruir
        después.
      </p>
      <EditorAudio
        url={receta.audioUrl}
        alGuardar={(audioUrl) => cambiar({ audioUrl })}
        alQuitar={() => cambiar({ audioUrl: null })}
      />
    </Bloque>
  )
}
