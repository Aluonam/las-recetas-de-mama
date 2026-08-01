import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Aviso, Cargando } from '../../ui/Estado'
import { useFormularioReceta } from './useFormularioReceta'
import { useAvisoAlSalir } from './useAvisoAlSalir'
import { AsistenteReceta } from './AsistenteReceta'
import { SeccionPlato, SeccionEspecial, SeccionVoz } from './secciones'
import { CamposProcedencia } from './CamposProcedencia'
import { EditorIngredientes } from './EditorIngredientes'
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
  const { receta, cambiar, guardar, cargando, guardando, error, hayCambios } =
    useFormularioReceta(id)

  const [guardado, setGuardado] = useState(false)

  /**
   * Aquí no hay borrador.
   *
   * La receta ya existe y está a salvo en el recetario; lo que se puede
   * perder son los cambios de este rato. Guardar un borrador encima
   * plantearía una pregunta fea al volver —cuál vale, lo guardado o lo
   * que dejaste a medias— para arreglar un caso mucho menos grave que
   * perder una receta entera sin escribir.
   */
  useAvisoAlSalir(hayCambios && !guardado)

  if (cargando) return <Cargando que="Abriendo la receta" />
  if (!receta) return <Aviso error={error ?? new Error('No se pudo cargar.')} />

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault()
    const guardadaId = await guardar()
    if (!guardadaId) return

    setGuardado(true)
    navegar(`/receta/${guardadaId}`)
  }

  const salir = () => {
    if (hayCambios) {
      const seguro = window.confirm(
        'Has cambiado cosas y no están guardadas.\n\n' +
          'Si sales ahora, la receta se queda como estaba. ¿Salir?',
      )
      if (!seguro) return
    }
    navegar(-1)
  }

  return (
    <form onSubmit={enviar} className="space-y-10">

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
        <button type="button" className="boton-secundario" onClick={salir}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
