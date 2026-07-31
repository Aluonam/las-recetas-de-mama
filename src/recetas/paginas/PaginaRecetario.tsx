import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarRecetas } from '../api'
import type { RecetaResumen } from '../tipos'
import { Aviso, Cargando } from '../../ui/Estado'
import { TarjetaReceta } from '../componentes/TarjetaReceta'
import { FiltroOcasiones } from '../componentes/FiltroOcasiones'
import { PanelIndice } from '../indice/PanelIndice'
import { PanelLibro } from '../libro/PanelLibro'
import { useFamilia } from '../../familias/contexto'
import { AvisoInstalar } from '../../pwa/AvisoInstalar'
import { SelectorVista } from '../indice/SelectorVista'
import { usePreferenciaVista } from '../indice/usePreferenciaVista'
import { useAbrirEnGrande } from '../../ui/useAbrirEnGrande'

/** Portada: todas las recetas, con buscador y filtro por ocasión. */
export function PaginaRecetario() {
  const [recetas, setRecetas] = useState<RecetaResumen[] | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [busqueda, setBusqueda] = useState('')
  const [ocasion, setOcasion] = useState<string | null>(null)
  const { vista, agrupacion, cambiar } = usePreferenciaVista()
  const { familia } = useFamilia()

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
   * Al salir de Fichas se limpia el filtro de celebración.
   *
   * Los filtros solo se ven ahí, así que dejarlos puestos escondería
   * recetas en el libro o en el índice sin nada en pantalla que explicara
   * por qué faltan.
   */
  const cambiarVista = (parche: Parameters<typeof cambiar>[0]) => {
    if (parche.vista && parche.vista !== 'fichas') setOcasion(null)
    cambiar(parche)
  }

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

  /**
   * El libro se abre a pantalla completa.
   *
   * Es lo que se viene a ver, así que se lleva la pantalla entera y la
   * cabecera se queda justo encima: deslizando hacia abajo vuelve, con
   * el buscador y las solapas. En Fichas y en Índice no se hace, porque
   * ahí lo que se busca es la vista general.
   */
  const zonaLibro = useAbrirEnGrande<HTMLDivElement>(
    vista === 'libro' && visibles.length > 0,
  )

  if (error != null) return <Aviso error={error} />
  if (!recetas) return <Cargando que="Sacando el recetario" />
  if (recetas.length === 0) return <RecetarioVacio />

  return (
    <div>
      <h1 className="mb-6 text-3xl sm:text-4xl">El recetario</h1>

      <AvisoInstalar />

      <div className="mb-6 flex flex-col gap-3">
        <label htmlFor="buscar" className="sr-only">
          Buscar receta
        </label>
        <input
          id="buscar"
          type="search"
          className="campo"
          placeholder="Buscar por plato o por quién la hacía…"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
        />

        <SelectorVista
          vista={vista}
          agrupacion={agrupacion}
          alCambiar={cambiarVista}
        />

        {/* Los filtros de celebración viven dentro de Fichas: es la vista
            para rebuscar. «Todas» enseña el recetario entero sin recortes. */}
        {vista === 'fichas' && (
          <FiltroOcasiones
            ocasiones={ocasiones}
            seleccionada={ocasion}
            alSeleccionar={setOcasion}
          />
        )}
      </div>

      {visibles.length === 0 ? (
        <p className="py-12 text-center text-tinta-suave">
          Ninguna receta encaja con esa búsqueda.
        </p>
      ) : vista === 'libro' ? (
        <div ref={zonaLibro} className="flex min-h-svh flex-col justify-center">
          <PanelLibro recetas={visibles} todas={recetas} />
        </div>
      ) : vista === 'indice' ? (
        <PanelIndice recetas={visibles} modo={agrupacion} />
      ) : (
        <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((receta) => (
            <li key={receta.id}>
              <TarjetaReceta receta={receta} />
            </li>
          ))}
        </ul>
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
