import { useNavigate, useParams } from 'react-router-dom'
import { Aviso, Cargando } from '../../ui/Estado'
import { CampoArea, CampoTexto } from '../../ui/Campo'
import { useFormularioReceta } from './useFormularioReceta'
import { CamposProcedencia } from './CamposProcedencia'
import { SelectorOcasiones } from './SelectorOcasiones'
import { SubirFoto } from './SubirFoto'
import { EditorIngredientes, UnidadesSugeridas } from './EditorIngredientes'
import { EditorMateriales } from './EditorMateriales'
import { EditorPasos } from './EditorPasos'
import { EditorTrucos } from './EditorTrucos'

/**
 * Escribir o editar una receta. La misma pantalla para las dos cosas: sin
 * `id` crea, con `id` edita.
 *
 * Aquí solo se colocan secciones. El estado vive en useFormularioReceta y
 * cada bloque de campos en su propio archivo.
 */
export function PaginaEditarReceta() {
  const { id } = useParams<{ id: string }>()
  const navegar = useNavigate()

  const { receta, cambiar, guardar, cargando, guardando, error } =
    useFormularioReceta(id)

  if (cargando) return <Cargando que="Abriendo la receta" />
  if (!receta) return <Aviso error={error ?? new Error('No se pudo cargar.')} />

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault()
    const guardadaId = await guardar()
    if (guardadaId) navegar(`/receta/${guardadaId}`)
  }

  return (
    <form onSubmit={enviar} className="space-y-6">
      <UnidadesSugeridas />

      <h1 className="text-3xl sm:text-4xl">
        {id ? 'Editar receta' : 'Escribir una receta'}
      </h1>

      <fieldset className="tarjeta m-0 space-y-4 p-4 sm:p-5">
        <legend className="px-2 font-titulo text-xl font-semibold">
          La receta
        </legend>

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
      </fieldset>

      <CamposProcedencia
        procedencia={receta.procedencia}
        alCambiar={(procedencia) => cambiar({ procedencia })}
      />

      <fieldset className="tarjeta m-0 p-4 sm:p-5">
        <legend className="px-2 font-titulo text-xl font-semibold">
          ¿Qué hace especial a esta receta?
        </legend>
        <CampoArea
          etiqueta="Cuéntalo"
          ayuda="La historia, el recuerdo, por qué esta y no otra. Este campo es el que hace que valga la pena guardarla."
          rows={5}
          placeholder="Es lo primero que olía la casa cuando llegábamos en Navidad. La abuela empezaba el día antes y no dejaba entrar a nadie en la cocina."
          value={receta.porQueEspecial ?? ''}
          onChange={(e) => cambiar({ porQueEspecial: e.target.value })}
        />
      </fieldset>

      <EditorIngredientes
        ingredientes={receta.ingredientes}
        alCambiar={(ingredientes) => cambiar({ ingredientes })}
      />

      <EditorMateriales
        materiales={receta.materiales}
        alCambiar={(materiales) => cambiar({ materiales })}
      />

      <EditorPasos
        pasos={receta.pasos}
        alCambiar={(pasos) => cambiar({ pasos })}
      />

      <EditorTrucos
        trucos={receta.trucos}
        alCambiar={(trucos) => cambiar({ trucos })}
      />

      {error != null && <Aviso error={error} />}

      {/* En móvil se queda pegada abajo: el formulario es largo. */}
      <div className="sticky bottom-0 flex flex-wrap gap-2 border-t border-borde bg-papel py-4">
        <button
          type="submit"
          className="boton-principal flex-1 sm:flex-none"
          disabled={guardando}
        >
          {guardando ? 'Guardando…' : 'Guardar receta'}
        </button>
        <button
          type="button"
          className="boton-secundario"
          onClick={() => navegar(-1)}
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
