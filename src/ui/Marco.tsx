import { Link, NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useSesion } from '../nucleo/sesion'
import { HAY_SUPABASE } from '../nucleo/entorno'
import { SelectorRecetario } from '../familias/SelectorRecetario'

/**
 * Cabecera + contenido + pie.
 *
 * El contenido va sobre una «hoja» opaca centrada. El papel pintado del
 * body solo asoma por los márgenes, así que ningún texto cae encima del
 * estampado. En móvil no hay márgenes y el estampado sencillamente no se
 * ve: mejor eso que un fondo con ruido detrás de la letra.
 */
interface Props {
  children: ReactNode
  /**
   * Los botones de la cabecera.
   *
   * Se apagan en la bienvenida: allí no hay recetario todavía, así que
   * «Escribir una receta» llevaría a un sitio que no existe y «Salir» no
   * tendría de dónde. Un botón que no puede hacer nada no debe estar.
   */
  navegacion?: boolean
}

export function Marco({ children, navegacion = true }: Props) {
  const { salir } = useSesion()

  return (
    <div className="flex min-h-svh flex-col">
      {!HAY_SUPABASE && <AvisoDemostracion />}

      <header className="relative bg-verde-claro">
        {navegacion && (
          <>
            <NavLink
              to="/ajustes"
              aria-label="Ajustes"
              title="Ajustes"
              className={({ isActive }) =>
                // 44px de lado: el mínimo para acertar con el dedo.
                'absolute right-3 top-3 flex size-11 items-center justify-center rounded-full border transition-colors sm:right-4 sm:top-4 ' +
                (isActive
                  ? 'border-verde-texto bg-verde-texto text-papel'
                  : 'border-verde-texto bg-superficie text-verde-texto hover:bg-superficie-2')
              }
            >
              <Engranaje />
            </NavLink>

            {/* Salir va abajo del todo y apartado del engranaje: se usa
                poco y no conviene tenerlo pegado a lo que sí se toca. */}
            {HAY_SUPABASE && (
              <button
                type="button"
                onClick={() => {
                  const seguro = window.confirm(
                    '¿Estás seguro de que deseas salir?\n\n' +
                      'Para volver a entrar tendrás que escribir de nuevo el ' +
                      'código de tu familia.',
                  )
                  if (seguro) salir()
                }}
                className="absolute bottom-3 right-3 rounded-md border border-borde bg-superficie px-3 py-1.5 text-xs font-semibold text-tinta-suave transition-colors hover:bg-superficie-2 sm:right-4"
              >
                Salir
              </button>
            )}
          </>
        )}

        <div className="mx-auto max-w-5xl px-4 py-5 text-center sm:py-6">
          <Link
            to="/"
            className="marco-doble inline-block rounded-full bg-superficie px-6 py-2 no-underline sm:px-10"
          >
            <span className="block font-titulo text-lg font-bold text-verde-texto sm:text-2xl">
              Las Recetas de Mamá
            </span>
            <span className="versalitas mt-0.5 block text-rosa-texto">
              Recetario de familia
            </span>
          </Link>

          <nav
            hidden={!navegacion}
            className="mt-5 flex flex-wrap items-center justify-center gap-2"
          >
            <NavLink
              to="/nueva"
              className={({ isActive }) =>
                (isActive ? 'boton-principal' : 'boton-secundario') +
                ' whitespace-nowrap px-4 py-2 text-sm no-underline sm:text-base'
              }
            >
              Escribir una receta
            </NavLink>

          </nav>

          {navegacion && <SelectorRecetario />}
        </div>
      </header>

      {/* Cenefa de Talavera, como remate de la cabecera. */}
      <div className="cenefa" aria-hidden="true" />

      <div className="mx-auto w-full max-w-5xl flex-1 border-borde bg-papel sm:border-x">
        <main className="px-4 py-6 sm:py-8">{children}</main>
      </div>

      {/* La cenefa cierra abajo igual que abre arriba, como en un zócalo. */}
      <div className="cenefa" aria-hidden="true" />

      {/* Sin greca en el pie: la cenefa de arriba ya cierra el contenido y
          dos adornos seguidos se estorbaban. */}
      <footer className="bg-verde-claro px-4 py-6 text-center">
        {/* Una cita larga no cabe en versalitas: va en cursiva, como se
            citaría en un libro, y la firma debajo. */}
        <blockquote className="mx-auto max-w-md">
          <p className="font-titulo text-lg italic leading-snug text-verde-texto">
            «Uno no puede pensar bien, amar bien, dormir bien, si no ha comido
            bien.»
          </p>
          <cite className="versalitas mt-2 block not-italic text-rosa-texto">
            Virginia Woolf
          </cite>
        </blockquote>
      </footer>
    </div>
  )
}

/** Engranaje de trazo grueso, para que no desentone con el resto. */
function Engranaje() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5"
    >
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 2.2v2.6M12 19.2v2.6M4.1 4.1l1.9 1.9M18 18l1.9 1.9M2.2 12h2.6M19.2 12h2.6M4.1 19.9 6 18M18 6l1.9-1.9" />
    </svg>
  )
}

function AvisoDemostracion() {
  return (
    <p className="bg-acento px-4 py-2 text-center text-sm text-acento-tinta">
      <strong>Modo demostración.</strong> Las recetas se guardan solo en este
      navegador. Configura Supabase para compartirlas con la familia.
    </p>
  )
}
