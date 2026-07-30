import { supabase } from '../nucleo/supabase'
import type { Familia } from './tipos'

/**
 * Recetarios: crear el propio, entrar en uno con código y cambiar la
 * llave.
 *
 * Las tres operaciones son funciones de la base y no consultas sueltas.
 * Crear un recetario significa además hacerse miembro, y entrar con un
 * código significa comprobarlo y darse de alta: son pasos que tienen que
 * ocurrir juntos o no ocurrir. Dejarlo en manos del navegador sería
 * confiar en que nadie interrumpe a mitad.
 */

interface FilaFamilia {
  id: string
  nombre: string
  codigo: string
}

/** Los recetarios a los que pertenece quien tiene la sesión abierta. */
export async function misRecetarios(): Promise<Familia[]> {
  const { data, error } = await supabase
    .from('familia')
    .select('id, nombre, codigo')
    .order('creada_en', { ascending: true })

  if (error) throw error
  return (data ?? []) as FilaFamilia[]
}

export async function crearRecetario(
  nombre: string,
  codigo?: string,
  correo?: string,
): Promise<Familia> {
  const { data, error } = await supabase
    .rpc('crear_recetario', {
      p_nombre: nombre.trim(),
      // Sin código propio, la base genera uno.
      p_codigo: codigo?.trim() || null,
      // El correo va como argumento y no se saca de la sesión: la
      // sesión es anónima y no lleva ninguno.
      p_correo: correo?.trim() || null,
    })
    .single()

  if (error) throw error
  return data as Familia
}

export async function unirseConCodigo(
  codigo: string,
  correo?: string,
): Promise<Familia> {
  const { data, error } = await supabase
    .rpc('unirse_con_codigo', {
      p_codigo: codigo.trim(),
      p_correo: correo?.trim() || null,
    })
    .single()

  if (error) throw error
  return data as Familia
}

/** Genera uno nuevo al azar. */
export async function cambiarCodigo(familiaId: string): Promise<string> {
  const { data, error } = await supabase.rpc('cambiar_codigo', {
    p_familia_id: familiaId,
  })

  if (error) throw error
  return data as string
}

/** Pone el que se le diga. La base valida y lo guarda en mayúsculas. */
export async function establecerCodigo(
  familiaId: string,
  codigo: string,
): Promise<string> {
  const { data, error } = await supabase.rpc('establecer_codigo', {
    p_familia_id: familiaId,
    p_codigo: codigo,
  })

  if (error) throw error
  return data as string
}
