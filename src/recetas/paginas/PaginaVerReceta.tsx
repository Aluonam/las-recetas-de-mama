import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { borrarReceta, obtenerReceta } from '../api'
import type { Receta } from '../tipos'
import { useSesion } from '../../nucleo/sesion'
import { Aviso, Cargando } from '../../ui/Estado'
import { CabeceraReceta } from '../componentes/CabeceraReceta'
import { ListaIngredientes } from '../componentes/ListaIngredientes'
import { ListaPasos } from '../componentes/ListaPasos'
import { ListaTrucos } from '../componentes/ListaTrucos'
import { GaleriaFotos } from '../componentes/GaleriaFotos'
import { SeccionVariantes } from '../../variantes/SeccionVariantes'

/**
 * Ficha completa de una receta. Esta página solo carga datos y coloca
 * secciones; cada sección sabe pintarse sola.
 */
export function PaginaVerReceta() {
  const { id } = useParams<{ id: string }>()
  const navegar = useNavigate()
  const { sesion } = useSesion()

  const [receta, setReceta] = useState<Receta | null>(null)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    if (!id) return
    setReceta(null)
    obtenerReceta(id).then(setReceta).catch(setError)
  }, [id])

  const eliminar = async () => {
    if (!receta) return

    const seguro = window.confirm(
      `¿Borrar «${receta.titulo}»? Esto no se puede deshacer.`,
    )
    if (!seguro) return

    try {
      await borrarReceta(receta.id)
      navegar('/')
    } catch (e) {
      setError(e)
    }
  }

  if (error != null) return <Aviso error={error} />
  if (!receta) return <Cargando que="Buscando la receta" />

  return (
    <article>
      <CabeceraReceta
        receta={receta}
        puedeBorrar={sesion?.user.id === receta.creadaPor}
        alBorrar={eliminar}
      />

      {receta.porQueEspecial && (
        <section className="mb-8 rounded-xl border border-acento bg-acento-suave p-5 sm:p-6">
          <h2 className="mb-2 text-xl">Por qué esta receta es especial</h2>
          <p className="whitespace-pre-line">{receta.porQueEspecial}</p>
        </section>
      )}

      {/* En móvil, una columna. Desde md, ingredientes al lado de los pasos. */}
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_1.4fr]">
        <div className="space-y-8">
          <ListaIngredientes ingredientes={receta.ingredientes} />

          {receta.materiales.length > 0 && (
            <section>
              <h2 className="mb-3 text-2xl">Materiales</h2>
              <ul className="m-0 list-none space-y-2 p-0">
                {receta.materiales.map((material) => (
                  <li key={material.id}>
                    {material.nombre}
                    {material.nota && (
                      <span className="block text-sm text-tinta-suave">
                        {material.nota}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <ListaPasos pasos={receta.pasos} />
          <ListaTrucos trucos={receta.trucos} />
        </div>
      </div>

      <GaleriaFotos fotos={receta.fotos} />

      <SeccionVariantes recetaId={receta.id} />
    </article>
  )
}
