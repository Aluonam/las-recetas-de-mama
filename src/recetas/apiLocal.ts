import { escribir, leer } from '../nucleo/almacenLocal'
import { RECETAS_DE_EJEMPLO } from '../demo/semilla'
import { normalizarOcasiones } from './tipos'
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
  if (!guardadas) {
    escribir(CLAVE, RECETAS_DE_EJEMPLO)
    return RECETAS_DE_EJEMPLO
  }

  return migrarOcasiones(guardadas)
}

/**
 * Arregla las ocasiones renombradas o retiradas en lo ya guardado.
 *
 * Los filtros se construyen con las ocasiones que llevan las recetas, así
 * que sin esto un cambio de nombre no se notaría hasta volver a escribir
 * cada receta a mano. Se ejecuta al leer y solo reescribe si algo cambió.
 */
function migrarOcasiones(recetas: Receta[]): Receta[] {
  let huboCambios = false

  const migradas = recetas.map((receta) => {
    const ocasiones = normalizarOcasiones(receta.ocasiones)
    if (ocasiones.length === receta.ocasiones.length &&
        ocasiones.every((o, i) => o === receta.ocasiones[i])) {
      return receta
    }
    huboCambios = true
    return { ...receta, ocasiones }
  })

  if (huboCambios) {
    try {
      escribir(CLAVE, migradas)
    } catch {
      // Que no se pueda guardar la migración no debe impedir leer las
      // recetas: se verán bien igual y se reintentará en la próxima carga.
    }
  }

  return migradas
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
