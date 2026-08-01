import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { borrarReceta, obtenerReceta } from '../api'
import type { Receta } from '../tipos'
import { useFamilia } from '../../familias/contexto'
import { Aviso, Cargando } from '../../ui/Estado'
import { CabeceraReceta } from '../componentes/CabeceraReceta'
import { ListaIngredientes } from '../componentes/ListaIngredientes'
import { ListaPasos } from '../componentes/ListaPasos'
import { ListaTrucos } from '../componentes/ListaTrucos'
import { GaleriaFotos } from '../componentes/GaleriaFotos'
import { SeccionVariantes } from '../../variantes/SeccionVariantes'
import { ReproductorAudio } from '../audio/ReproductorAudio'
import { useAbrirEnGrande } from '../../ui/useAbrirEnGrande'
import { Confirmar } from '../../ui/Confirmar'

/**
 * Ficha completa de una receta. Esta página solo carga datos y coloca
 * secciones; cada sección sabe pintarse sola.
 */
export function PaginaVerReceta() {
  const { id } = useParams<{ id: string }>()
  const navegar = useNavigate()
  const { soyDuena } = useFamilia()

  const [receta, setReceta] = useState<Receta | null>(null)
  const [error, setError] = useState<unknown>(null)

  /* La receta se abre a pantalla completa, con la cabecera justo encima:
     deslizando hacia abajo vuelve. */
  const zona = useAbrirEnGrande(receta != null)

  useEffect(() => {
    if (!id) return
    setReceta(null)
    obtenerReceta(id).then(setReceta).catch(setError)
  }, [id])

  const [preguntando, setPreguntando] = useState(false)

  const eliminar = async () => {
    if (!receta) return
    setPreguntando(false)

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
    <article ref={zona} className="min-h-svh">
      <CabeceraReceta
        receta={receta}
        // Borrar es de quien creó el recetario, no de quien escribió la
        // receta: una receta borrada por error no vuelve.
        puedeBorrar={soyDuena}
        alBorrar={() => setPreguntando(true)}
      />

      {preguntando && (
        <Confirmar
          peligroso
          titulo={`¿Borrar «${receta.titulo}»?`}
          detalle="No se puede deshacer: se van también sus fotos, su audio y las variantes que haya escrito la familia."
          textoSi={`Sí, borrar «${receta.titulo}»`}
          alSi={eliminar}
          alNo={() => setPreguntando(false)}
        />
      )}

      {receta.audioUrl && (
        <section className="tarjeta mb-12 p-4 sm:p-5">
          <ReproductorAudio
            url={receta.audioUrl}
            titulo="Contada con su voz"
            descripcion={
              receta.procedencia.autorNombre
                ? `${receta.procedencia.autorNombre} explicando la receta.`
                : undefined
            }
          />
        </section>
      )}

      {receta.porQueEspecial && (
        <section className="bloque-especial mb-12 p-5 sm:p-7">
          <h2 className="mb-2 text-xl">Por qué esta receta es especial</h2>
          <p className="whitespace-pre-line">{receta.porQueEspecial}</p>
        </section>
      )}

      {/* En móvil, una columna. Desde md, ingredientes al lado de los pasos. */}
      <div className="grid gap-12 md:grid-cols-[minmax(0,1fr)_1.4fr] md:gap-14">
        <div className="space-y-12">
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

        <div className="space-y-12">
          <ListaPasos pasos={receta.pasos} />
          <ListaTrucos trucos={receta.trucos} />
        </div>
      </div>

      <GaleriaFotos fotos={receta.fotos} />

      {/* A todo el ancho: aquí separa dos secciones, y una greca corta y
          centrada parecía un adorno suelto en vez de una línea divisoria. */}
      <div className="guirnalda mt-16 w-full" aria-hidden="true" />

      <SeccionVariantes recetaId={receta.id} />
    </article>
  )
}
