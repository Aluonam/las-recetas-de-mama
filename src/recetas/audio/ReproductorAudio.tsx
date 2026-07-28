interface Props {
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
  return (
    <div>
      {titulo && <h2 className="mb-1 text-xl">{titulo}</h2>}
      {descripcion && (
        <p className="mb-3 text-tinta-suave">{descripcion}</p>
      )}

      <audio controls preload="metadata" src={url} className="w-full">
        Tu navegador no puede reproducir este audio.
      </audio>
    </div>
  )
}
