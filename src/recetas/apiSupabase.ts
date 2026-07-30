import { supabase, usuarioActual } from '../nucleo/supabase'
import { exigirFamilia } from '../familias/actual'
import type {
  Foto,
  Ingrediente,
  Material,
  Paso,
  Receta,
  RecetaEditable,
  RecetaResumen,
  Truco,
} from './tipos'

/**
 * Acceso a datos de recetas. Es la única frontera con la base: las páginas
 * importan de aquí y no saben que existe Supabase.
 */

/** La base habla snake_case; la app, camelCase. Aquí se traduce. */
interface FilaReceta {
  id: string
  titulo: string
  descripcion: string | null
  autor_nombre: string | null
  autor_relacion: string | null
  aprendida_de: string | null
  anio_origen: number | null
  por_que_especial: string | null
  ocasiones: string[] | null
  raciones: string | null
  tiempo_minutos: number | null
  ingredientes: Ingrediente[] | null
  materiales: Material[] | null
  pasos: Paso[] | null
  trucos: Truco[] | null
  fotos: Foto[] | null
  foto_portada_url: string | null
  audio_url: string | null
  creada_por: string
  creada_en: string
  actualizada_en: string
}

function aReceta(fila: FilaReceta): Receta {
  return {
    id: fila.id,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    procedencia: {
      autorNombre: fila.autor_nombre,
      autorRelacion: fila.autor_relacion,
      aprendidaDe: fila.aprendida_de,
      anioOrigen: fila.anio_origen,
    },
    porQueEspecial: fila.por_que_especial,
    ocasiones: fila.ocasiones ?? [],
    raciones: fila.raciones,
    tiempoMinutos: fila.tiempo_minutos,
    ingredientes: fila.ingredientes ?? [],
    materiales: fila.materiales ?? [],
    pasos: fila.pasos ?? [],
    trucos: fila.trucos ?? [],
    fotos: fila.fotos ?? [],
    fotoPortadaUrl: fila.foto_portada_url,
    audioUrl: fila.audio_url,
    creadaPor: fila.creada_por,
    creadaEn: fila.creada_en,
    actualizadaEn: fila.actualizada_en,
  }
}

/** Los textos vacíos se guardan como null: "sin dato" es null, no "". */
const oNulo = (texto?: string | null) => texto?.trim() || null

function aFila(receta: RecetaEditable) {
  return {
    titulo: receta.titulo.trim(),
    descripcion: oNulo(receta.descripcion),
    autor_nombre: oNulo(receta.procedencia.autorNombre),
    autor_relacion: oNulo(receta.procedencia.autorRelacion),
    aprendida_de: oNulo(receta.procedencia.aprendidaDe),
    anio_origen: receta.procedencia.anioOrigen || null,
    por_que_especial: oNulo(receta.porQueEspecial),
    ocasiones: receta.ocasiones,
    raciones: oNulo(receta.raciones),
    tiempo_minutos: receta.tiempoMinutos || null,
    ingredientes: receta.ingredientes,
    materiales: receta.materiales,
    pasos: receta.pasos,
    trucos: receta.trucos,
    fotos: receta.fotos,
    foto_portada_url: oNulo(receta.fotoPortadaUrl),
    audio_url: oNulo(receta.audioUrl),
  }
}

const COLUMNAS_RESUMEN =
  'id, titulo, descripcion, ocasiones, foto_portada_url, tiempo_minutos, autor_nombre'

export async function listarRecetas(): Promise<RecetaResumen[]> {
  /**
   * El filtro por recetario es imprescindible aquí.
   *
   * Las reglas de la base dejan ver las recetas de TODOS los recetarios a
   * los que perteneces, que es lo correcto: son tuyas. Pero quien está
   * mirando el de la yaya no quiere ver mezcladas las de su madre.
   *
   * Sin esto, el selector de arriba cambiaba el nombre y no filtraba
   * nada.
   */
  const { data, error } = await supabase
    .from('receta')
    .select(COLUMNAS_RESUMEN)
    .eq('familia_id', exigirFamilia())
    .order('titulo', { ascending: true })

  if (error) throw error

  return (data ?? []).map((fila) => ({
    id: fila.id,
    titulo: fila.titulo,
    descripcion: fila.descripcion,
    ocasiones: fila.ocasiones ?? [],
    fotoPortadaUrl: fila.foto_portada_url,
    tiempoMinutos: fila.tiempo_minutos,
    autorNombre: fila.autor_nombre,
  }))
}

export async function obtenerReceta(id: string): Promise<Receta> {
  const { data, error } = await supabase
    .from('receta')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return aReceta(data as FilaReceta)
}

export async function crearReceta(receta: RecetaEditable): Promise<Receta> {
  const creadaPor = await usuarioActual()

  const { data, error } = await supabase
    .from('receta')
    // La familia va explícita: las reglas de la base rechazan una receta
    // que no pertenezca a un recetario del que seas miembro.
    .insert({
      ...aFila(receta),
      creada_por: creadaPor,
      familia_id: exigirFamilia(),
    })
    .select('*')
    .single()

  if (error) throw error
  return aReceta(data as FilaReceta)
}

export async function actualizarReceta(
  id: string,
  receta: RecetaEditable,
): Promise<Receta> {
  const { data, error } = await supabase
    .from('receta')
    .update(aFila(receta))
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return aReceta(data as FilaReceta)
}

export async function borrarReceta(id: string): Promise<void> {
  const { error } = await supabase.from('receta').delete().eq('id', id)
  if (error) throw error
}
