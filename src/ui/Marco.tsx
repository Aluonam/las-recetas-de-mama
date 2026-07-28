import { Link, NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useSesion } from '../nucleo/sesion'

/**
 * Cabecera + contenido + pie. Responsive: en móvil el título ocupa la
 * primera línea y los botones bajan a la segunda; a partir de `sm` va todo
 * en una fila.
 */
export function Marco({ children }: { children: ReactNode }) {
  const { sesion, salir } = useSesion()

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b border-borde bg-superficie">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
          <Link
            to="/"
            className="font-titulo text-lg font-semibold no-underline sm:text-xl"
          >
            Las Recetas de Mamá
          </Link>

          <nav className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
            <NavLink
              to="/nueva"
              className={({ isActive }) =>
                (isActive ? 'boton-principal' : 'boton-secundario') +
                ' flex-1 whitespace-nowrap px-3 py-2 text-sm no-underline sm:flex-none sm:px-4 sm:text-base'
              }
            >
              Escribir una receta
            </NavLink>

            {sesion && (
              <button
                type="button"
                onClick={salir}
                className="boton-secundario px-3 py-2 text-sm sm:px-4 sm:text-base"
                title={sesion.user.email ?? undefined}
              >
                Salir
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-borde px-4 py-6 text-center text-sm text-tinta-suave">
        Hecho para que no se pierdan.
      </footer>
    </div>
  )
}
