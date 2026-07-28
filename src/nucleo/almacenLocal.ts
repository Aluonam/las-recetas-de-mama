/**
 * Guardado en `localStorage` con JSON. Lo usa el modo demostración.
 *
 * Deliberadamente mínimo: no es una base de datos, es una libreta para que
 * la app se pueda probar sin cuenta.
 */

export function leer<T>(clave: string, porDefecto: T): T {
  try {
    const bruto = localStorage.getItem(clave)
    return bruto ? (JSON.parse(bruto) as T) : porDefecto
  } catch {
    // JSON corrupto o almacenamiento bloqueado: se empieza de cero.
    return porDefecto
  }
}

export function escribir<T>(clave: string, valor: T): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    throw new Error(
      'No se pudo guardar en este navegador. Puede que no quede espacio ' +
        'o que estés en una ventana privada.',
    )
  }
}
