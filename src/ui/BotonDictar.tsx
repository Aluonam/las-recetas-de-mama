import { useRef } from 'react'
import { SE_PUEDE_DICTAR, useDictado } from '../recetas/audio/useDictado'

/**
 * «Dictar»: se habla y se escribe solo en el campo de al lado.
 *
 * Lo dictado se añade a lo que ya hubiera, no lo sustituye: se puede
 * escribir un poco, dictar un trozo y seguir escribiendo. Y se separa
 * con un espacio o con un punto y aparte según el campo, para no
 * empalmar dos frases sin querer.
 *
 * Si el navegador no sabe hacerlo, el botón no está. Nadie ve un botón
 * que no funciona.
 */
/**
 * Se acuerda de lo que había escrito sin depender de que se lo digan.
 *
 * Al dictar, el texto que llega se añade a lo que ya hubiera. Pero el
 * campo se actualiza y vuelve a pintar este botón, y con el dictado
 * seguido pueden llegar dos frases antes de que eso ocurra: la segunda
 * se sumaba al texto de antes de la primera y se la comía.
 */
export function BotonDictar({
  valor,
  alCambiar,
  etiqueta,
  enLineaAparte = false,
}: {
  valor: string
  alCambiar: (texto: string) => void
  /** Qué se está dictando, para quien no ve la pantalla. */
  etiqueta: string
  /** Cada trozo dictado empieza una línea nueva, para las listas. */
  enLineaAparte?: boolean
}) {
  const ultimo = useRef(valor)
  ultimo.current = valor

  const dictado = useDictado((dicho) => {
    const hay = ultimo.current.trimEnd()
    const junto = hay ? hay + (enLineaAparte ? '\n' : ' ') + dicho : dicho

    // Se anota ya, sin esperar a que vuelva por las props: si llega otra
    // frase antes de eso, tiene que sumarse a esta y no a la anterior.
    ultimo.current = junto
    alCambiar(junto)
  })

  /**
   * Donde el navegador no sabe dictar, se dice.
   *
   * Antes no salía nada, y quien había visto el botón en otro sitio
   * pensaba que estaba roto. Se dice además dónde sí está, porque en una
   * tablet lo está: la tecla del micrófono del teclado hace lo mismo.
   */
  if (!SE_PUEDE_DICTAR) {
    return (
      <p className="mt-2 text-sm text-tinta-suave">
        Este navegador no sabe dictar. En el móvil o la tablet, usa la tecla
        del micrófono del teclado.
      </p>
    )
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={dictado.escuchando ? dictado.parar : dictado.empezar}
        aria-label={
          dictado.escuchando
            ? `Dejar de dictar ${etiqueta}`
            : `Dictar ${etiqueta} en voz alta`
        }
        aria-pressed={dictado.escuchando}
        // `select-none`: al mantenerlo pulsado —que es lo que hace
        // cualquiera con un botón de micrófono— el navegador entendía
        // que se quería seleccionar el texto y lo pintaba de azul.
        className={
          'flex select-none items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ' +
          (dictado.escuchando
            ? 'border-rosa-medio bg-rosa-medio text-papel'
            : 'border-borde bg-superficie text-tinta-suave hover:bg-superficie-2')
        }
      >
        {dictado.escuchando ? (
          <span
            aria-hidden="true"
            className="size-3 animate-pulse rounded-full bg-papel"
          />
        ) : (
          <Microfono />
        )}
        {dictado.escuchando ? 'Escuchando… pulsa para parar' : 'Dictar'}
      </button>

      {/**
       * Lo que va oyendo, mientras lo oye.
       *
       * Como el teclado del móvil. Sirve para dos cosas: se ve que
       * funciona sin esperar a que acabe la frase —antes había que
       * fiarse de que «parece que graba»— y se ve cuándo está
       * entendiendo mal, que con los nombres de una receta de la abuela
       * pasa más de lo que parece.
       */}
      {dictado.escuchando && (
        <p
          role="status"
          className="mt-2 min-h-6 text-sm italic text-tinta-suave"
        >
          {dictado.aMedias || 'Te escucho…'}
        </p>
      )}

      {dictado.error && (
        <p role="status" className="mt-2 text-sm text-rosa-texto">
          {dictado.error}
        </p>
      )}
    </div>
  )
}

function Microfono() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      aria-hidden="true"
      className="size-4"
    >
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
    </svg>
  )
}
