import { createClient } from '@supabase/supabase-js'
import { CONFIG_SUPABASE } from './entorno'

/**
 * Único punto donde la app conoce a Supabase.
 *
 * El resto del código habla con `recetas/api.ts` o `variantes/api.ts`, nunca
 * con este cliente directamente. Así, cambiar de proveedor de datos toca un
 * archivo por funcionalidad y ninguna pantalla.
 */
export const supabase = createClient(CONFIG_SUPABASE.url, CONFIG_SUPABASE.clave)

/** Id de la persona con sesión abierta, o error si no la hay. */
export async function usuarioActual(): Promise<string> {
  const { data } = await supabase.auth.getUser()
  const id = data.user?.id
  if (!id) throw new Error('Hay que iniciar sesión para hacer esto.')
  return id
}
