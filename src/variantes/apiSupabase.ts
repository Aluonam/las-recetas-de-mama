import { supabase, usuarioActual } from '../nucleo/supabase'
import type { Variante, VarianteNueva } from './tipos'

/**
 * Acceso a datos de variantes.
 *
 * Funcionalidad propia, no un apéndice de recetas: una variante la escribe
 * otra persona, en otro momento, sobre una receta que ya existe.
 */

interface FilaVariante {
  id: string
  receta_id: string
  autor_nombre: string
  titulo: string
  texto: string
  creada_en: string
}

const aVariante = (fila: FilaVariante): Variante => ({
  id: fila.id,
  recetaId: fila.receta_id,
  autorNombre: fila.autor_nombre,
  titulo: fila.titulo,
  texto: fila.texto,
  creadaEn: fila.creada_en,
})

export async function listarVariantes(recetaId: string): Promise<Variante[]> {
  const { data, error } = await supabase
    .from('variante')
    .select('*')
    .eq('receta_id', recetaId)
    .order('creada_en', { ascending: true })

  if (error) throw error
  return (data ?? []).map(aVariante)
}

export async function crearVariante(
  recetaId: string,
  variante: VarianteNueva,
): Promise<void> {
  const creadaPor = await usuarioActual()

  const { error } = await supabase.from('variante').insert({
    receta_id: recetaId,
    autor_nombre: variante.autorNombre.trim(),
    titulo: variante.titulo.trim(),
    texto: variante.texto.trim(),
    creada_por: creadaPor,
  })

  if (error) throw error
}
