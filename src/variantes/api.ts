import { HAY_SUPABASE } from '../nucleo/entorno'
import * as remoto from './apiSupabase'
import * as local from './apiLocal'

/** Frontera de datos de variantes. Ver `recetas/api.ts`. */
const impl = HAY_SUPABASE ? remoto : local

export const listarVariantes = impl.listarVariantes
export const crearVariante = impl.crearVariante
