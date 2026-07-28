import { escribir, leer } from '../nucleo/almacenLocal'
import { VARIANTES_DE_EJEMPLO } from '../demo/semilla'
import type { Variante, VarianteNueva } from './tipos'

/** Variantes guardadas en este navegador. Modo demostración. */

const CLAVE = 'variantes'

function todas(): Variante[] {
  const guardadas = leer<Variante[] | null>(CLAVE, null)
  if (guardadas) return guardadas

  escribir(CLAVE, VARIANTES_DE_EJEMPLO)
  return VARIANTES_DE_EJEMPLO
}

export async function listarVariantes(recetaId: string): Promise<Variante[]> {
  return todas()
    .filter((variante) => variante.recetaId === recetaId)
    .sort((a, b) => a.creadaEn.localeCompare(b.creadaEn))
}

export async function crearVariante(
  recetaId: string,
  variante: VarianteNueva,
): Promise<void> {
  const nueva: Variante = {
    id: crypto.randomUUID(),
    recetaId,
    autorNombre: variante.autorNombre.trim(),
    titulo: variante.titulo.trim(),
    texto: variante.texto.trim(),
    creadaEn: new Date().toISOString(),
  }

  escribir(CLAVE, [...todas(), nueva])
}
