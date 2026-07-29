import { useUrlArchivo } from './useUrlArchivo'

interface Props {
  /** Ruta del bucket, o una dirección ya utilizable. */
  archivo?: string | null
  alt?: string
  className?: string
  loading?: 'lazy' | 'eager'
  /** Qué pintar mientras se firma el enlace, o si no hay foto. */
  hueco?: React.ReactNode
}

/**
 * Una foto guardada en el recetario.
 *
 * Existe para que ningún componente tenga que saber que las fotos viven
 * en un bucket privado y que hay que firmar cada enlace.
 */
export function Imagen({
  archivo,
  alt = '',
  className,
  loading = 'lazy',
  hueco = null,
}: Props) {
  const url = useUrlArchivo(archivo)

  if (!url) return <>{hueco}</>

  return <img src={url} alt={alt} loading={loading} className={className} />
}
