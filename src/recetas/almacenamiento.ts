import { supabase } from '../nucleo/supabase'

/**
 * Subida de imágenes al bucket `recetas`.
 *
 * Aparte de api.ts a propósito: guardar archivos y guardar filas son dos
 * responsabilidades distintas, y el día que entre el audio de la abuela irá
 * aquí sin tocar el acceso a recetas.
 */

const TAMANO_MAXIMO = 10 * 1024 * 1024 // 10 MB
const TIPOS_ACEPTADOS = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

/** Sube una imagen y devuelve su URL pública. */
export async function subirFoto(archivo: File): Promise<string> {
  if (!TIPOS_ACEPTADOS.includes(archivo.type)) {
    throw new Error('Solo se pueden subir fotos (JPG, PNG, WebP o HEIC).')
  }
  if (archivo.size > TAMANO_MAXIMO) {
    throw new Error('La foto pesa más de 10 MB. Prueba con una más pequeña.')
  }

  const extension = archivo.name.split('.').pop()?.toLowerCase() || 'jpg'
  const ruta = `${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage
    .from('recetas')
    .upload(ruta, archivo, { cacheControl: '31536000', upsert: false })

  if (error) throw error

  const { data } = supabase.storage.from('recetas').getPublicUrl(ruta)
  return data.publicUrl
}
