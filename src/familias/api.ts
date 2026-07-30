import { HAY_SUPABASE } from '../nucleo/entorno'
import * as remoto from './apiSupabase'
import * as local from './apiLocal'

/** Frontera de datos de recetarios. Ver `recetas/api.ts`. */
const impl = HAY_SUPABASE ? remoto : local

export const misRecetarios = impl.misRecetarios
export const crearRecetario = impl.crearRecetario
export const unirseConCodigo = impl.unirseConCodigo
export const cambiarCodigo = impl.cambiarCodigo
export const establecerCodigo = impl.establecerCodigo
