import { Link, NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useSesion } from '../nucleo/sesion'
import { HAY_SUPABASE } from '../nucleo/entorno'

/**
 * Cabecera + contenido + pie.
 *
 * El contenido va sobre una «hoja» opaca centrada. El papel pintado del
 * body solo asoma por los márgenes, así que ningún texto cae encima del
 * estampado. En móvil no hay márgenes y el estampado sencillamente no se
 * ve: mejor eso que un fondo con ruido detrás de la letra.
 */
export function Marco({ children }: { children: ReactNode }) {
  const { correo, salir } = useSesion()

  return (
    <div className="flex min-h-svh flex-col">
      {!HAY_SUPABASE && <AvisoDemostracion />}

      <header className="bg-salvia">
        <div className="mx-auto max-w-5xl px-4 py-5 text-center sm:py-6">
          <Link
            to="/"
            className="marco-doble inline-block rounded-full bg-superficie px-6 py-2 no-underline sm:px-10"
          >
            <span className="block font-titulo text-lg font-bold text-salvia-texto sm:text-2xl">
              Las Recetas de Mamá
            </span>
            <span className="versalitas mt-0.5 block text-lavanda-texto">
              Recetario de familia
            </span>
          </Link>

          <nav className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <NavLink
              to="/nueva"
              className={({ isActive }) =>
                (isActive ? 'boton-principal' : 'boton-secundario') +
                ' whitespace-nowrap px-4 py-2 text-sm no-underline sm:text-base'
              }
            >
              Escribir una receta
            </NavLink>

            {HAY_SUPABASE && (
              <button
                type="button"
                onClick={salir}
                className="boton-secundario px-4 py-2 text-sm sm:text-base"
                title={correo ?? undefined}
              >
                Salir
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Cenefa de Talavera, como remate de la cabecera. */}
      <div className="cenefa" aria-hidden="true" />

      <div className="mx-auto w-full max-w-5xl flex-1 border-borde bg-papel sm:border-x">
        <main className="px-4 py-6 sm:py-8">{children}</main>
      </div>

      {/* La cenefa cierra abajo igual que abre arriba, como en un zócalo. */}
      <div className="cenefa" aria-hidden="true" />

      <footer className="bg-salvia px-4 py-5 text-center">
        <div className="guirnalda mx-auto max-w-xs" aria-hidden="true" />
        <p className="versalitas mt-2 text-salvia-texto">
          Hecho para que no se pierdan
        </p>
      </footer>
    </div>
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
