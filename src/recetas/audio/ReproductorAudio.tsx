import { useUrlArchivo } from '../archivos/useUrlArchivo'

interface Props {
  /** Ruta del bucket, o una dirección ya utilizable. */
  url: string
  /** Encabezado opcional, para cuando va suelto en la ficha. */
  titulo?: string
  descripcion?: string
}

/**
 * Reproductor nativo del navegador: ya trae controles grandes, accesibles y
 * conocidos. Escribir uno propio sería trabajo para empeorarlo.
 */
export function ReproductorAudio({ url, titulo, descripcion }: Props) {
  const firmada = useUrlArchivo(url)

  return (
    <div>
      {titulo && <h2 className="mb-1 text-xl">{titulo}</h2>}
      {descripcion && (
        <p className="mb-3 text-tinta-suave">{descripcion}</p>
      )}

      {firmada ? (
        <audio controls preload="metadata" src={firmada} className="w-full">
          Tu navegador no puede reproducir este audio.
        </audio>
      ) : (
        <p role="status" className="text-tinta-suave">
          Preparando el audio…
        </p>
      )}
    </div>
  )
}
