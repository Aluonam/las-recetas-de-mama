import type { CSSProperties, ReactNode } from 'react'
import type { Sentido } from './useNavegacionLibro'

/**
 * En cuántos trozos se parte la hoja para que se doble.
 *
 * Tres es lo justo: con dos se ve un pliegue de mapa de carreteras y con
 * cuatro no se gana nada que el ojo distinga en medio segundo.
 */
const TRAMOS = 3

/** Cuánto se oscurece cada tramo en lo alto del giro. Ver `PLIEGUE`. */
const SOMBRA = [0.04, 0.11, 0.2]

/**
 * La hoja que pasa, doblándose.
 *
 * Una hoja de papel no gira rígida. La coges por el canto de fuera y
 * tiras: ese canto va por delante, la parte pegada a la costura se queda
 * atrás, y el papel se arquea entre las dos. Al final el canto aterriza
 * primero y el resto se posa detrás. Eso es lo que se ve al pasar una
 * página, y una lámina plana girando no se le parece.
 *
 * Aquí la hoja se parte en tramos encajados uno dentro de otro, cada uno
 * colgado del anterior. Como cada tramo hereda el giro de su padre y le
 * suma el suyo, los ángulos se acumulan solos —0, φ, 2φ— y sale una
 * curva quebrada sin tener que calcular nada. Es la misma idea que una
 * cadena de bisagras.
 *
 * Para que el doblez se vea hay que darle luz: los tramos se van
 * oscureciendo hacia fuera, como se oscurece el papel según se aparta de
 * la ventana. Sin esa sombra el pliegue existe en la geometría pero no
 * en la pantalla.
 *
 * Cada tramo enseña su trozo de página: el contenido va a triple ancho
 * dentro de una ventana que lo recorta. Por detrás el orden se invierte,
 * porque al darse la vuelta el tramo que estaba junto a la costura sigue
 * junto a la costura, pero el papel que enseña ya es el de la otra cara.
 */
export function HojaGirando({
  sentido,
  delante,
  detras,
}: {
  sentido: Sentido
  /** La página derecha: lo que se ve con la hoja en su sitio. */
  delante: ReactNode
  /** La página izquierda: lo que se ve con la hoja tumbada. */
  detras: ReactNode
}) {
  return (
    <div
      aria-hidden="true"
      className={
        'hoja-girando hidden md:block ' +
        (sentido === 'adelante' ? 'gira-adelante' : 'gira-atras')
      }
    >
      <Tramo nivel={0} sentido={sentido} delante={delante} detras={detras} />
    </div>
  )
}

function Tramo({
  nivel,
  sentido,
  delante,
  detras,
}: {
  nivel: number
  sentido: Sentido
  delante: ReactNode
  detras: ReactNode
}) {
  if (nivel >= TRAMOS) return null

  return (
    <div
      style={{ '--sombra': SOMBRA[nivel] } as CSSProperties}
      className={
        (nivel === 0 ? 'tramo tramo-primero' : 'tramo tramo-colgado') +
        // El primero va clavado a la costura: lo que gira es lo que
        // cuelga de él.
        (nivel === 0
          ? ''
          : sentido === 'adelante'
            ? ' pliega-adelante'
            : ' pliega-atras')
      }
    >
      <div className="cara">
        <div className={`ventana ventana-${nivel}`}>{delante}</div>
      </div>

      <div className="cara cara-dorso">
        <div className={`ventana ventana-${TRAMOS - 1 - nivel}`}>{detras}</div>
      </div>

      <Tramo
        nivel={nivel + 1}
        sentido={sentido}
        delante={delante}
        detras={detras}
      />
    </div>
  )
}
