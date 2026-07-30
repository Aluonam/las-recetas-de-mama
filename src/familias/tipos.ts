/**
 * Un recetario familiar.
 *
 * El código es la llave: se comparte por WhatsApp y quien lo escriba
 * entra. Se puede cambiar cuando se quiera —quien ya entró sigue dentro—
 * porque ser miembro no depende de seguir sabiendo el código.
 */
export interface Familia {
  id: string
  nombre: string
  codigo: string
  /**
   * Quién lo creó. Es quien puede borrar recetas: el resto de la familia
   * ve y edita, pero no hace desaparecer nada.
   *
   * Puede venir vacío al crear el recetario o al entrar con un código,
   * porque la base solo devuelve ahí lo imprescindible. Se rellena en la
   * siguiente carga.
   */
  creadaPor?: string | null
}
