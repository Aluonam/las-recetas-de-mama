import type { RecetaEditable } from '../tipos'
import { Campo, CampoArea, CampoTexto } from '../../ui/Campo'
import { textoTiempo } from '../formato'
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

/** De uno a cincuenta. Por encima ya no es una comida de casa. */
const COMENSALES = Array.from({ length: 50 }, (_, n) => n + 1)

/**
 * Los tiempos que se dicen de verdad, en minutos.
 *
 * Nadie cocina «37 minutos»: se dice media hora, tres cuartos, hora y
 * media. Van más juntos al principio, donde la diferencia importa —de
 * 5 a 10 minutos se duplica el trabajo—, y más sueltos al final, donde
 * un guiso de cuatro o cinco horas es lo mismo: ponerlo y olvidarse.
 *
 * El texto lo pone `textoTiempo`, el mismo que lo enseña luego en la
 * receta, así que la lista y la ficha dicen lo mismo.
 */
const TIEMPOS = [
  5, 10, 15, 20, 30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 480, 720,
]

export interface Props {
  receta: RecetaEditable
  cambiar: (parche: Partial<RecetaEditable>) => void
}

/** Tarjeta con leyenda, igual en el asistente y en la página larga. */
function Bloque({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="tarjeta m-0 space-y-4 p-4 sm:p-5">
      <legend className="px-2 font-titulo text-xl font-semibold">
        {titulo}
      </legend>
      {children}
    </fieldset>
  )
}

export function SeccionPlato({ receta, cambiar }: Props) {
  /**
   * Antes esto era texto libre, así que puede haber recetas guardadas
   * con «para 4 si viene el tío». Si lo que hay no está en la lista se
   * añade como una opción más: un desplegable que no encuentra su valor
   * se enseña en blanco, y al guardar habría borrado en silencio lo que
   * alguien escribió.
   */
  const raciones = receta.raciones?.trim() ?? ''
  const aMano = raciones && !COMENSALES.some((n) => String(n) === raciones)

  // Lo mismo con el tiempo, que antes se escribía en minutos sueltos.
  const tiempoAMano =
    receta.tiempoMinutos != null && !TIEMPOS.includes(receta.tiempoMinutos)

  return (
    <Bloque titulo="La receta">
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
        {/* Antes era texto libre —«para 4 si viene el tío»— y sonaba muy
            de casa, pero obligaba a escribir a mano lo que en el 99% de
            las recetas es un número. Una lista se elige de un toque. */}
        <Campo etiqueta="¿Para cuántos?">
          {(id) => (
            <select
              id={id}
              className="campo"
              value={raciones}
              onChange={(e) => cambiar({ raciones: e.target.value })}
            >
              <option value="">Sin indicar</option>
              {aMano && <option value={raciones}>{raciones}</option>}
              {COMENSALES.map((cuantos) => (
                <option key={cuantos} value={String(cuantos)}>
                  {cuantos}
                </option>
              ))}
            </select>
          )}
        </Campo>

        <Campo etiqueta="¿Cuánto lleva?">
          {(id) => (
            <select
              id={id}
              className="campo"
              value={receta.tiempoMinutos ?? ''}
              onChange={(e) =>
                cambiar({
                  tiempoMinutos:
                    e.target.value === '' ? null : Number(e.target.value),
                })
              }
            >
              <option value="">Sin indicar</option>
              {tiempoAMano && (
                <option value={receta.tiempoMinutos!}>
                  {textoTiempo(receta.tiempoMinutos)}
                </option>
              )}
              {TIEMPOS.map((minutos) => (
                <option key={minutos} value={minutos}>
                  {textoTiempo(minutos)}
                </option>
              ))}
            </select>
          )}
        </Campo>
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

export function SeccionEspecial({ receta, cambiar }: Props) {
  return (
    <Bloque titulo="¿Qué hace especial a esta receta?">
      <CampoArea
        etiqueta="Cuéntalo"
        ayuda="La historia, el recuerdo, por qué esta y no otra."
        rows={5}
        placeholder="Es lo primero que olía la casa cuando llegábamos en Navidad. La abuela empezaba el día antes y no dejaba entrar a nadie en la cocina."
        value={receta.porQueEspecial ?? ''}
        onChange={(e) => cambiar({ porQueEspecial: e.target.value })}
        // Este es el campo que más se queda en blanco y el que más vale:
        // hay quien no lo escribe pero lo cuenta sin pensarlo.
        dictable={(porQueEspecial) => cambiar({ porQueEspecial })}
      />
    </Bloque>
  )
}

export function SeccionVoz({ receta, cambiar }: Props) {
  return (
    // Sin explicación: los botones dicen «Grabar» y «Subir un audio», y
    // un párrafo encima contando lo mismo solo estorbaba.
    <Bloque titulo="Su voz">
      <EditorAudio
        url={receta.audioUrl}
        alGuardar={(audioUrl) => cambiar({ audioUrl })}
        alQuitar={() => cambiar({ audioUrl: null })}
      />
    </Bloque>
  )
}
