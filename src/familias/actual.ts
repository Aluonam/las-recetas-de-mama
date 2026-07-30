/**
 * El recetario abierto, accesible desde fuera de React.
 *
 * La capa de datos necesita saber en qué recetario está para poder
 * guardar una receta o subir una foto a la carpeta que toca, y ahí no
 * hay contexto de React al que preguntar.
 *
 * Es una variable global, con lo que eso tiene de feo, pero acotada a
 * propósito: la escribe solo el proveedor de familia y la leen solo
 * `recetas/api.ts` y `recetas/almacenamiento.ts`.
 */

let abierto: string | null = null

export const familiaActual = () => abierto

export const recordarFamilia = (id: string | null) => {
  abierto = id
}

/** Igual que `familiaActual`, pero falla en vez de devolver null. */
export function exigirFamilia(): string {
  if (!abierto) {
    throw new Error(
      'No hay ningún recetario abierto. Crea uno, o entra con tu código familiar.',
    )
  }
  return abierto
}
