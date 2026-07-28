const url = import.meta.env.VITE_SUPABASE_URL
const clave = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * ¿Hay Supabase configurado?
 *
 * Si no lo hay, la app arranca en modo demostración: guarda en este
 * navegador y trae recetas de ejemplo. Sirve para probarla sin dar de alta
 * nada y para enseñársela a la familia antes de montar la cuenta.
 */
export const HAY_SUPABASE = Boolean(url && clave)

export const CONFIG_SUPABASE = {
  // Valores de relleno para que createClient no proteste en modo
  // demostración. Nunca se usan: en ese modo no se llama a la red.
  url: url || 'https://demostracion.supabase.co',
  clave: clave || 'demostracion',
}
