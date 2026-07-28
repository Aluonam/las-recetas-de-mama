import { useState } from 'react'
import type { Agrupacion } from './agrupar'

export type Vista = 'fichas' | 'indice' | 'libro'

const CLAVE = 'vista-recetario'

interface Preferencia {
  vista: Vista
  agrupacion: Agrupacion
}

const POR_DEFECTO: Preferencia = { vista: 'fichas', agrupacion: 'plato' }

/**
 * Recuerda cómo prefieres ver el recetario.
 *
 * Sin esto, entrar en una receta y volver te devolvía siempre a las
 * fichas: React Router desmonta la página y el estado se pierde. Para una
 * preferencia de interfaz, que falle el guardado da igual, así que aquí
 * los errores se tragan en vez de romper la vista.
 */
export function usePreferenciaVista() {
  const [preferencia, setPreferencia] = useState<Preferencia>(() => {
    try {
      const bruto = localStorage.getItem(CLAVE)
      return bruto ? { ...POR_DEFECTO, ...JSON.parse(bruto) } : POR_DEFECTO
    } catch {
      return POR_DEFECTO
    }
  })

  const cambiar = (parche: Partial<Preferencia>) => {
    const siguiente = { ...preferencia, ...parche }
    setPreferencia(siguiente)
    try {
      localStorage.setItem(CLAVE, JSON.stringify(siguiente))
    } catch {
      // Ventana privada o sin espacio: se pierde la preferencia y ya está.
    }
  }

  return { ...preferencia, cambiar }
}
