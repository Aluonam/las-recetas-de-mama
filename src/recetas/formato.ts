import type { Ingrediente, Procedencia } from './tipos'

/**
 * Funciones puras de presentación. Sin React y sin red: se pueden probar
 * con `expect(textoCantidad(...)).toBe(...)` y se reutilizan en la ficha,
 * en el modo cocina y en cualquier exportación futura a PDF.
 */

/**
 * Cómo se lee una cantidad. Si hay medida casera, manda ella: "un puñado"
 * dice más que "30 g" cuando la receta la contó tu abuela. Si están las
 * dos, la exacta va entre paréntesis para quien quiera pesar.
 */
export function textoCantidad(ingrediente: Ingrediente): string {
  const exacta = [ingrediente.cantidad, ingrediente.unidad]
    .filter((parte) => parte !== null && parte !== undefined && parte !== '')
    .join(' ')
    .trim()

  const casera = ingrediente.cantidadCasera?.trim() ?? ''

  if (casera && exacta) return `${casera} (${exacta})`
  return casera || exacta
}

/** "De la abuela Carmen (abuela), hacia 1958" */
export function textoProcedencia(procedencia: Procedencia): string | null {
  const { autorNombre, autorRelacion, anioOrigen } = procedencia
  if (!autorNombre?.trim()) return null

  let texto = `De ${autorNombre.trim()}`
  if (autorRelacion?.trim()) texto += ` (${autorRelacion.trim()})`
  if (anioOrigen) texto += `, hacia ${anioOrigen}`
  return texto
}

/** Agrupa ingredientes por `grupo` conservando el orden de entrada. */
export function agruparIngredientes(
  ingredientes: Ingrediente[],
): Array<{ grupo: string | null; items: Ingrediente[] }> {
  const grupos: Array<{ grupo: string | null; items: Ingrediente[] }> = []

  for (const ingrediente of ingredientes) {
    const grupo = ingrediente.grupo?.trim() || null
    const existente = grupos.find((g) => g.grupo === grupo)
    if (existente) existente.items.push(ingrediente)
    else grupos.push({ grupo, items: [ingrediente] })
  }

  return grupos
}

/** "1 h 20 min", "45 min". Null si no se indicó tiempo. */
export function textoTiempo(minutos?: number | null): string | null {
  if (!minutos || minutos <= 0) return null
  if (minutos < 60) return `${minutos} min`

  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`
}

export const nuevoId = () => crypto.randomUUID()
