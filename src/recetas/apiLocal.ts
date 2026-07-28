import { escribir, leer } from '../nucleo/almacenLocal'
import { RECETAS_DE_EJEMPLO } from '../demo/semilla'
import type { Receta, RecetaEditable, RecetaResumen } from './tipos'

/**
 * Recetas guardadas en este navegador. Modo demostración.
 *
 * Misma firma que `apiSupabase.ts`, así que las pantallas no notan cuál de
 * los dos está detrás. Es el motivo por el que existe la frontera `api.ts`.
 */

const CLAVE = 'recetas'
const USUARIO_DEMO = '00000000-0000-4000-8000-000000000001'

function todas(): Receta[] {
  // La primera vez se siembra con ejemplos: un recetario vacío no enseña
  // nada de lo que hace especial a este proyecto.
  const guardadas = leer<Receta[] | null>(CLAVE, null)
  if (guardadas) return guardadas

  escribir(CLAVE, RECETAS_DE_EJEMPLO)
  return RECETAS_DE_EJEMPLO
}

/** Marca de tiempo en ISO, como la que devolvería PostgreSQL. */
const ahora = () => new Date().toISOString()

export async function listarRecetas(): Promise<RecetaResumen[]> {
  return todas()
    .map((receta) => ({
      id: receta.id,
      titulo: receta.titulo,
      descripcion: receta.descripcion,
      ocasiones: receta.ocasiones,
      fotoPortadaUrl: receta.fotoPortadaUrl,
      tiempoMinutos: receta.tiempoMinutos,
      autorNombre: receta.procedencia.autorNombre,
    }))
    .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))
}

export async function obtenerReceta(id: string): Promise<Receta> {
  const receta = todas().find((r) => r.id === id)
  if (!receta) throw new Error('Esa receta ya no está.')
  return receta
}

export async function crearReceta(receta: RecetaEditable): Promise<Receta> {
  const nueva: Receta = {
    ...receta,
    id: crypto.randomUUID(),
    creadaPor: USUARIO_DEMO,
    creadaEn: ahora(),
    actualizadaEn: ahora(),
  }

  escribir(CLAVE, [...todas(), nueva])
  return nueva
}

export async function actualizarReceta(
  id: string,
  receta: RecetaEditable,
): Promise<Receta> {
  const anterior = await obtenerReceta(id)
  const actualizada: Receta = { ...anterior, ...receta, actualizadaEn: ahora() }

  escribir(
    CLAVE,
    todas().map((r) => (r.id === id ? actualizada : r)),
  )
  return actualizada
}

export async function borrarReceta(id: string): Promise<void> {
  escribir(
    CLAVE,
    todas().filter((r) => r.id !== id),
  )
}
