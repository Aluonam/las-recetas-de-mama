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
  const dictado = useDictado((dicho) => {
    const hay = valor.trimEnd()
    if (!hay) return alCambiar(dicho)
    alCambiar(hay + (enLineaAparte ? '\n' : ' ') + dicho)
  })

  if (!SE_PUEDE_DICTAR) return null

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
        className={
          'flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors ' +
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
