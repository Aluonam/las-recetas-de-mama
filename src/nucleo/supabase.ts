import { createClient } from '@supabase/supabase-js'

/**
 * Único punto donde la app conoce a Supabase.
 *
 * El resto del código habla con `recetas/api.ts` o `variantes/api.ts`, nunca
 * con este cliente directamente. Así, cambiar de proveedor de datos toca un
 * archivo por funcionalidad y ninguna pantalla.
 */

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Faltan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY. ' +
      'Copia .env.example a .env.local y rellena tus claves de Supabase.',
  )
}

export const supabase = createClient(url, anonKey)

/** Id de la persona con sesión abierta, o error si no la hay. */
export async function usuarioActual(): Promise<string> {
  const { data } = await supabase.auth.getUser()
  const id = data.user?.id
  if (!id) throw new Error('Hay que iniciar sesión para hacer esto.')
  return id
}
