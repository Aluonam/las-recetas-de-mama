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
  // En demostración quien mira es siempre quien lo creó, así se puede
  // probar también el borrado.
  creadaPor: '00000000-0000-4000-8000-000000000001',
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

export async function crearRecetario(
  nombre: string,
  codigo?: string,
  _correo?: string,
): Promise<Familia> {
  const actual = guardada()
  const nueva = {
    ...actual,
    nombre: nombre.trim(),
    codigo: codigo?.trim().toUpperCase() || actual.codigo,
  }
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

export async function soyJefe(): Promise<boolean> {
  // En demostración quien mira es siempre quien lo creó.
  return true
}

export async function correoDelAdministrador(): Promise<string | null> {
  // En demostración no hay nadie más al otro lado.
  return null
}

export async function establecerCodigo(
  _familiaId: string,
  codigo: string,
): Promise<string> {
  // Los mismos textos que en la base, para que no haya dos versiones del
  // mismo mensaje según en qué modo se esté.
  const limpio = codigo.trim().toUpperCase()
  if (limpio.length < 5) {
    throw new Error('El código necesita al menos 5 caracteres.')
  }
  if (limpio.length > 32) {
    throw new Error('El código no puede pasar de 32 caracteres.')
  }
  if (!/^[A-Z0-9-]+$/.test(limpio)) {
    throw new Error('El código solo admite letras sin tilde, números y guiones.')
  }

  escribir(CLAVE, { ...guardada(), codigo: limpio })
  return limpio
}
