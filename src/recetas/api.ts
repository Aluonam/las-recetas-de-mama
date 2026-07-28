import { HAY_SUPABASE } from '../nucleo/entorno'
import * as remoto from './apiSupabase'
import * as local from './apiLocal'

/**
 * Frontera de datos de recetas. Las pantallas importan de aquí y no saben
 * si detrás hay Supabase o el navegador.
 *
 * Con claves configuradas manda `apiSupabase`; sin ellas, `apiLocal` y modo
 * demostración. Las dos implementaciones tienen la misma firma, así que
 * ninguna vista cambia.
 */
const impl = HAY_SUPABASE ? remoto : local

export const listarRecetas = impl.listarRecetas
export const obtenerReceta = impl.obtenerReceta
export const crearReceta = impl.crearReceta
export const actualizarReceta = impl.actualizarReceta
export const borrarReceta = impl.borrarReceta
