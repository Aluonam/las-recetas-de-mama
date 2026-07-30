import { escribir, leer } from '../nucleo/almacenLocal'
import type { Familia } from './tipos'

/**
 * Recetarios del modo demostración.
 *
 * Aquí no hay varias familias que separar —todo vive en un navegador—,
 * pero la app pregunta igual por el recetario actual. Se inventa uno para
 * que las pantallas no tengan que saber en qué modo están.
 */

const CLAVE = 'familia'

const DEMOSTRACION: Familia = {
  id: 'f0000000-0000-4000-8000-000000000001',
  nombre: 'Las recetas de casa',
  codigo: 'MEMBRILLO-1958',
}

function guardada(): Familia {
  const suya = leer<Familia | null>(CLAVE, null)
  if (suya) return suya

  escribir(CLAVE, DEMOSTRACION)
  return DEMOSTRACION
}

export async function misRecetarios(): Promise<Familia[]> {
  return [guardada()]
}

export async function crearRecetario(nombre: string): Promise<Familia> {
  const nueva = { ...guardada(), nombre: nombre.trim() }
  escribir(CLAVE, nueva)
  return nueva
}

export async function unirseConCodigo(): Promise<Familia> {
  // Cualquier código vale: no hay nadie más al otro lado.
  return guardada()
}

export async function cambiarCodigo(): Promise<string> {
  const actual = guardada()
  const nuevo = `MEMBRILLO-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
  escribir(CLAVE, { ...actual, codigo: nuevo })
  return nuevo
}
