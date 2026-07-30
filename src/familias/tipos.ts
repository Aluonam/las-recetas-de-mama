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
}
