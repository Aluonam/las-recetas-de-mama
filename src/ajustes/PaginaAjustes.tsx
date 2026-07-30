import { Link } from 'react-router-dom'
import { PanelCodigo } from '../familias/PanelCodigo'
import { BotonCopia } from '../copias/BotonCopia'
import { EscribirAlAdministrador } from './EscribirAlAdministrador'
import { useFamilia } from '../familias/contexto'

/**
 * Todo lo que no es una receta.
 *
 * Antes vivía al final de la portada, y allí estorbaba: la portada es
 * para las recetas. Aquí está a un toque, y quien no lo necesita no lo ve.
 */
export function PaginaAjustes() {
  const { familia } = useFamilia()

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-3xl sm:text-4xl">Ajustes</h1>
      {familia && (
        <p className="mb-8 text-tinta-suave">
          Recetario <strong>{familia.nombre}</strong>
        </p>
      )}

      <div className="space-y-8">
        <PanelCodigo />
        <EscribirAlAdministrador />
        <BotonCopia />
      </div>

      <div className="mt-10 text-center">
        <Link to="/" className="boton-secundario no-underline">
          Volver al recetario
        </Link>
      </div>
    </div>
  )
}
