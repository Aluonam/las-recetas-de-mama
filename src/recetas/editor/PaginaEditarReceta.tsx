import { useNavigate, useParams } from 'react-router-dom'
import { Aviso, Cargando } from '../../ui/Estado'
import { useFormularioReceta } from './useFormularioReceta'
import { AsistenteReceta } from './AsistenteReceta'
import { SeccionPlato, SeccionEspecial, SeccionVoz } from './secciones'
import { CamposProcedencia } from './CamposProcedencia'
import { EditorIngredientes, UnidadesSugeridas } from './EditorIngredientes'
import { EditorMateriales } from './EditorMateriales'
import { EditorPasos } from './EditorPasos'
import { EditorTrucos } from './EditorTrucos'

/**
 * Escribir o editar una receta.
 *
 * Sin `id` se escribe una nueva, y para eso está el asistente: quien
 * empieza de cero no sabe cuántos campos hay ni cuáles importan, y
 * veinte a la vez no se rellenan, se cierran.
 *
 * Con `id` se edita, y aquí el asistente estorbaría: si vienes a
 * cambiarle el tiempo de horno a las torrijas, quieres ver la receta
 * entera y tocar ese campo, no pasar por cinco pantallas buscándolo.
 *
 * Los campos son exactamente los mismos —viven en secciones.tsx— y las
 * dos formas guardan por el mismo camino.
 */
export function PaginaEditarReceta() {
  const { id } = useParams<{ id: string }>()

  if (!id) return <AsistenteReceta />
  return <Edicion id={id} />
}

function Edicion({ id }: { id: string }) {
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
    <form onSubmit={enviar} className="space-y-10">
      <UnidadesSugeridas />

      <h1 className="text-3xl sm:text-4xl">Editar receta</h1>

      <SeccionPlato receta={receta} cambiar={cambiar} />

      <CamposProcedencia
        procedencia={receta.procedencia}
        alCambiar={(procedencia) => cambiar({ procedencia })}
      />

      <SeccionVoz receta={receta} cambiar={cambiar} />

      <SeccionEspecial receta={receta} cambiar={cambiar} />

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
