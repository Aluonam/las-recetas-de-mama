import { anclaDe } from './agrupar'

interface Props {
  /** Letras que tienen alguna receta. */
  letras: string[]
}

/**
 * Guía lateral de la A a la Z, como el canto de una agenda.
 *
 * Solo se muestran las letras que tienen recetas: enseñar veinte letras
 * muertas para que la familia tenga ocho platos es ruido.
 */
export function GuiaAlfabeto({ letras }: Props) {
  if (letras.length < 2) return null

  const saltar = (clave: string) => {
    document
      .getElementById(anclaDe(clave))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      aria-label="Saltar a una letra"
      // Pegada al lateral y centrada en la ventana, como el canto del libro.
      className="sticky top-24 hidden h-fit flex-col items-center gap-0.5 sm:flex"
    >
      {letras.map((letra) => (
        <button
          key={letra}
          type="button"
          onClick={() => saltar(letra)}
          // 28px de alto: menos no se acierta con el dedo.
          className="flex h-7 w-7 items-center justify-center rounded font-titulo text-sm font-semibold text-rosa-texto transition-colors hover:bg-superficie-2"
        >
          {letra}
        </button>
      ))}
    </nav>
  )
}
