import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarRecetas } from '../api'
import type { RecetaResumen } from '../tipos'
import { Aviso, Cargando } from '../../ui/Estado'
import { TarjetaReceta } from '../componentes/TarjetaReceta'
import { BarraRecetario } from '../componentes/BarraRecetario'
import { PanelIndice } from '../indice/PanelIndice'
import { LibroPantallaCompleta } from '../libro/LibroPantallaCompleta'
import { useFamilia } from '../../familias/contexto'
import { AvisoInstalar } from '../../pwa/AvisoInstalar'
import { usePreferenciaVista } from '../indice/usePreferenciaVista'

/** Portada: todas las recetas, con buscador y filtro por ocasión. */
export function PaginaRecetario() {
  const [recetas, setRecetas] = useState<RecetaResumen[] | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [busqueda, setBusqueda] = useState('')
  const [ocasion, setOcasion] = useState<string | null>(null)
  const { vista, agrupacion, columnas, cambiar } = usePreferenciaVista()
  const { familia } = useFamilia()

  /**
   * El libro se abre a pantalla completa, que es como se mira un libro:
   * él solo, sin web alrededor. Con la X se vuelve a la lista.
   *
   * No se recuerda de una vez para otra: entrar en el recetario es venir
   * a ver qué hay, y abrir el libro es un gesto que se hace cuando se
   * quiere hojear.
   */
  const [libroAbierto, setLibroAbierto] = useState(false)

  /**
   * Se vuelven a pedir al cambiar de recetario.
   *
   * Antes se pedían una sola vez al entrar, así que cambiar de recetario
   * en el selector cambiaba el nombre de arriba y dejaba las recetas del
   * anterior en pantalla.
   */
  useEffect(() => {
    if (!familia) return
    setRecetas(null)
    setError(null)
    setOcasion(null)
    listarRecetas().then(setRecetas).catch(setError)
  }, [familia])

  /**
   * Al pasar a la lista se limpia el filtro de ocasión.
   *
   * Su desplegable solo está en tarjetas, así que dejarlo puesto
   * escondería recetas sin nada en pantalla que explicara por qué
   * faltan. La búsqueda no se toca: esa se ve siempre, con su caja y su
   * cruz, así que nunca esconde nada a escondidas.
   */
  useEffect(() => {
    if (vista !== 'fichas') setOcasion(null)
  }, [vista])

  /** Solo las ocasiones que alguien ha usado de verdad. */
  const ocasiones = useMemo(() => {
    const todas = (recetas ?? []).flatMap((receta) => receta.ocasiones)
    return [...new Set(todas)].sort((a, b) => a.localeCompare(b, 'es'))
  }, [recetas])

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()

    return (recetas ?? []).filter((receta) => {
      if (ocasion && !receta.ocasiones.includes(ocasion)) return false
      if (!texto) return true

      // Se busca también por quién la hacía: a veces recuerdas a la persona
      // antes que el nombre del plato.
      return [receta.titulo, receta.autorNombre, receta.descripcion]
        .filter(Boolean)
        .some((campo) => campo!.toLowerCase().includes(texto))
    })
  }, [recetas, busqueda, ocasion])

  if (error != null) return <Aviso error={error} />
  if (!recetas) return <Cargando que="Sacando el recetario" />
  if (recetas.length === 0) return <RecetarioVacio />

  return (
    <div>
      {/* Sin «El recetario» de título: la cabecera ya dice a qué web has
          entrado, y debajo hay recetas. Un renglón grande para nombrar
          lo que se está viendo es un renglón de menos para verlo. */}
      <h1 className="sr-only">El recetario</h1>

      <AvisoInstalar />

      <BarraRecetario
        busqueda={busqueda}
        alBuscar={setBusqueda}
        vista={vista}
        alCambiarVista={(nueva) => cambiar({ vista: nueva })}
        ocasiones={ocasiones}
        ocasion={ocasion}
        alFiltrar={setOcasion}
        agrupacion={agrupacion}
        alAgrupar={(nueva) => cambiar({ agrupacion: nueva })}
        columnas={columnas}
        alCambiarColumnas={(cuantas) => cambiar({ columnas: cuantas })}
        alAbrirLibro={() => setLibroAbierto(true)}
      />

      {visibles.length === 0 ? (
        <p className="py-12 text-center text-tinta-suave">
          Ninguna receta encaja con esa búsqueda.
        </p>
      ) : vista === 'indice' ? (
        <PanelIndice recetas={visibles} modo={agrupacion} />
      ) : (
        <ul className="rejilla m-0 list-none p-0" data-columnas={columnas}>
          {visibles.map((receta) => (
            <li key={receta.id}>
              <TarjetaReceta receta={receta} />
            </li>
          ))}
        </ul>
      )}

      {/* Va al final y por encima de todo: tapa la página entera. */}
      {libroAbierto && visibles.length > 0 && (
        <LibroPantallaCompleta
          recetas={visibles}
          todas={recetas}
          alCerrar={() => setLibroAbierto(false)}
        />
      )}
    </div>
  )
}

function RecetarioVacio() {
  return (
    <div className="tarjeta mx-auto max-w-lg p-6 text-center sm:p-8">
      <h1 className="mb-3 text-2xl sm:text-3xl">El recetario está vacío</h1>
      <p className="mb-6 text-tinta-suave">
        Empieza por la que primero se te venga a la cabeza. Esa que, si no la
        escribes tú, no la escribe nadie.
      </p>
      <Link to="/nueva" className="boton-principal no-underline">
        Escribir la primera receta
      </Link>
    </div>
  )
}
