import { useRef, useState } from 'react'
import { subirFoto } from '../almacenamiento'
import { Aviso } from '../../ui/Estado'
import { Imagen } from '../archivos/Imagen'

interface Props {
  etiqueta: string
  /** URL actual, si ya hay foto. */
  url?: string | null
  alSubir: (url: string) => void
  alQuitar?: () => void
}

/**
 * Selector de foto con subida inmediata.
 *
 * `capture` no se fuerza: en móvil el sistema ya ofrece cámara o galería, y
 * la mayoría de las fotos buenas de estas recetas ya están en el carrete.
 */
export function SubirFoto({ etiqueta, url, alSubir, alQuitar }: Props) {
  const entrada = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const elegir = async (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    if (!archivo) return

    setSubiendo(true)
    setError(null)
    try {
      alSubir(await subirFoto(archivo))
    } catch (e) {
      setError(e)
    } finally {
      setSubiendo(false)
      // Permite volver a elegir el mismo archivo si hubo error.
      if (entrada.current) entrada.current.value = ''
    }
  }

  return (
    <div>
      <span className="etiqueta">{etiqueta}</span>

      <Imagen
        archivo={url}
        className="mb-2 max-h-48 w-full rounded-lg object-cover"
      />

      <div className="flex flex-wrap gap-2">
        <label className="boton-secundario cursor-pointer">
          {subiendo ? 'Subiendo…' : url ? 'Cambiar foto' : 'Elegir foto'}
          <input
            ref={entrada}
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={subiendo}
            onChange={elegir}
          />
        </label>

        {url && alQuitar && (
          <button type="button" className="boton-secundario" onClick={alQuitar}>
            Quitar
          </button>
        )}
      </div>

      {error != null && (
        <div className="mt-2">
          <Aviso error={error} />
        </div>
      )}
    </div>
  )
}
