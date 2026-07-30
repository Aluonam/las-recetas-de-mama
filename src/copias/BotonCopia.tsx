import { useState } from 'react'
import { descargar, generarCopia } from './exportar'
import type { Progreso } from './exportar'
import { Aviso } from '../ui/Estado'

/**
 * Descargar el recetario entero en un archivo.
 *
 * Va al final de la portada y no escondido en unos ajustes: si hay que
 * buscarlo, no se hace nunca, y una copia que nadie hace no es una copia.
 */
export function BotonCopia() {
  const [progreso, setProgreso] = useState<Progreso | null>(null)
  const [error, setError] = useState<unknown>(null)

  const generar = async () => {
    setError(null)
    setProgreso({ hecho: 0, total: 1, paso: 'Empezando' })
    try {
      const copia = await generarCopia(setProgreso)
      descargar(copia, new Date())
    } catch (e) {
      setError(e)
    } finally {
      setProgreso(null)
    }
  }

  const porcentaje = progreso
    ? Math.round((progreso.hecho / Math.max(progreso.total, 1)) * 100)
    : 0

  return (
    <section className="tarjeta p-4 sm:p-5">
      <h2 className="mb-1 text-xl">Guarda una copia</h2>
      <p className="mb-4 text-tinta-suave">
        Descarga el recetario entero —recetas, fotos y audios— en un solo
        archivo. Ábrelo sin esta aplicación y guárdalo en más de un sitio.
      </p>

      {progreso ? (
        <div>
          <div
            className="mb-2 h-2 w-full overflow-hidden rounded-full bg-superficie-2"
            role="progressbar"
            aria-valuenow={porcentaje}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Preparando la copia"
          >
            <div
              className="h-full bg-verde-texto transition-all"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
          <p role="status" className="text-sm text-tinta-suave">
            {progreso.paso}…
          </p>
        </div>
      ) : (
        <button type="button" className="boton-secundario" onClick={generar}>
          Descargar copia de seguridad
        </button>
      )}

      {error != null && (
        <div className="mt-3">
          <Aviso error={error} />
        </div>
      )}
    </section>
  )
}
