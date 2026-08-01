import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listarRecetas } from '../api'
import type { RecetaResumen } from '../tipos'
import { Aviso, Cargando } from '../../ui/Estado'
import { TarjetaReceta } from '../componentes/TarjetaReceta'
import { FiltroOcasiones } from '../componentes/FiltroOcasiones'
import { BuscadorLupa } from '../componentes/BuscadorLupa'
import { PanelIndice } from '../indice/PanelIndice'
import { PanelLibro } from '../libro/PanelLibro'
import { LibroPantallaCompleta } from '../libro/LibroPantallaCompleta'
import { useFamilia } from '../../familias/contexto'
import { AvisoInstalar } from '../../pwa/AvisoInstalar'
import { SelectorVista } from '../indice/SelectorVista'
import { usePreferenciaVista } from '../indice/usePreferenciaVista'

/** Portada: todas las recetas, con buscador y filtro por ocasión. */
export function PaginaRecetario() {
  const [recetas, setRecetas] = useState<RecetaResumen[] | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [busqueda, setBusqueda] = useState('')
  const [ocasion, setOcasion] = useState<string | null>(null)
  const { vista, agrupacion, cambiar } = usePreferenciaVista()
  const { familia } = useFamilia()

  /**
   * El libro se abre a pantalla completa, que es como se mira un libro:
   * él solo, sin web alrededor. Con la X se vuelve a la página de
   * siempre, y desde ahí se puede entrar otra vez.
   */
  const [pantallaCompleta, setPantallaCompleta] = useState(vista === 'libro')

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
   * Las píldoras de ocasión solo se ven ahí, así que dejarlas puestas
   * escondería recetas en el libro o en el índice sin nada en pantalla
   * que explicara por qué faltan. La búsqueda no se toca: esa sí se ve
   * siempre, con su caja y su cruz, así que nunca esconde nada a
   * escondidas.
   */
  const cambiarVista = (parche: Parameters<typeof cambiar>[0]) => {
    if (!parche.vista) return cambiar(parche)

    if (parche.vista !== 'fichas') setOcasion(null)
    // Elegir «Libro» es pedir el libro, así que se abre como se mira.
    setPantallaCompleta(parche.vista === 'libro')
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

  if (error != null) return <Aviso error={error} />
  if (!recetas) return <Cargando que="Sacando el recetario" />
  if (recetas.length === 0) return <RecetarioVacio />

  return (
    <div>
      {/* El «+» va aquí y no en la cabecera: escribir una receta es una
          acción sobre el recetario, y en su esquina está donde se está
          mirando en vez de arriba del todo. */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <h1 className="m-0 text-3xl sm:text-4xl">El recetario</h1>

        <Link
          to="/nueva"
          aria-label="Escribir una receta"
          title="Escribir una receta"
          // 44px de lado: el mínimo para acertar con el dedo.
          className="boton-principal flex size-11 shrink-0 items-center justify-center p-0 text-2xl leading-none no-underline"
        >
          <span aria-hidden="true">+</span>
        </Link>
      </div>

      <AvisoInstalar />

      <div className="mb-6 flex flex-col gap-3">
        {/* `items-end`: la lupa se apoya en la misma raya en la que se
            apoyan las solapas, que es lo que las alinea. */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Fijo, como las solapas. Sale en las tres vistas, el libro
              incluido: buscar antes de abrirlo a pantalla completa es
              justo la manera de llegar a la receta que quieres sin
              hojear el abecedario entero. */}
          <BuscadorLupa busqueda={busqueda} alBuscar={setBusqueda} />

          <SelectorVista
            vista={vista}
            agrupacion={agrupacion}
            alCambiar={cambiarVista}
          />
        </div>

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
        <div>
          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={() => setPantallaCompleta(true)}
              className="boton-secundario"
            >
              Ver a pantalla completa
            </button>
          </div>
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

      {/* Va al final y por encima de todo: tapa la página entera. */}
      {vista === 'libro' && pantallaCompleta && visibles.length > 0 && (
        <LibroPantallaCompleta
          recetas={visibles}
          todas={recetas}
          alCerrar={() => setPantallaCompleta(false)}
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
