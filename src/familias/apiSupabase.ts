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

export async function crearRecetario(nombre: string): Promise<Familia> {
  const { data, error } = await supabase
    .rpc('crear_recetario', { p_nombre: nombre.trim() })
    .single()

  if (error) throw error
  return data as Familia
}

export async function unirseConCodigo(codigo: string): Promise<Familia> {
  const { data, error } = await supabase
    .rpc('unirse_con_codigo', { p_codigo: codigo.trim() })
    .single()

  if (error) throw error
  return data as Familia
}

export async function cambiarCodigo(familiaId: string): Promise<string> {
  const { data, error } = await supabase.rpc('cambiar_codigo', {
    p_familia_id: familiaId,
  })

  if (error) throw error
  return data as string
}
