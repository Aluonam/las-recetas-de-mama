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
  creada_por: string
}

/** Los recetarios a los que pertenece quien tiene la sesión abierta. */
export async function misRecetarios(): Promise<Familia[]> {
  const { data, error } = await supabase
    .from('familia')
    .select('id, nombre, codigo, creada_por')
    .order('creada_en', { ascending: true })

  if (error) throw error

  return ((data ?? []) as FilaFamilia[]).map((fila) => ({
    id: fila.id,
    nombre: fila.nombre,
    codigo: fila.codigo,
    creadaPor: fila.creada_por,
  }))
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

/**
 * ¿Manda quien pregunta en este recetario?
 *
 * Se le pregunta a la base en lugar de deducirlo comparando quién lo creó
 * con quién eres. Esa comparación dependía de que el dato hubiera llegado
 * completo, y al crear un recetario o entrar con un código la base
 * devuelve solo lo justo: el botón de borrar aparecía y desaparecía según
 * por dónde hubieras pasado.
 */
export async function soyJefe(familiaId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('soy_jefe', {
    p_familia_id: familiaId,
  })

  if (error) throw error
  return data === true
}

/**
 * El correo de quien administra el recetario, para poder escribirle.
 *
 * Puede venir vacío: quien lo creó no está obligado a haber dejado un
 * correo, y en ese caso no hay nadie a quien escribir.
 */
export async function correoDelAdministrador(
  familiaId: string,
): Promise<string | null> {
  const { data, error } = await supabase.rpc('administrador_del_recetario', {
    p_familia_id: familiaId,
  })

  if (error) throw error
  return (data as string | null) || null
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
