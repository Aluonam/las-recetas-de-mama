import { Link, NavLink, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { HAY_SUPABASE } from '../nucleo/entorno'

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
  return (
    <div className="flex min-h-svh flex-col">
      {!HAY_SUPABASE && <AvisoDemostracion />}

      <header className="relative bg-verde-claro">
        {/* Solo el engranaje. Cerrar sesión se fue al final de Ajustes:
            se usa una vez al año, cuesta deshacerlo, y aquí estaba a un
            dedo de lo que se toca a diario. */}
        {navegacion && <BotonAjustes />}

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
          {/* El corte va en la última coma: la enumeración entera arriba y
              la conclusión debajo, que es como se lee la frase. */}
          <p className="font-titulo text-lg italic leading-snug text-verde-texto">
            «Uno no puede pensar bien, amar bien, dormir bien,
            <br />
            si no ha comido bien.»
          </p>
          <cite className="versalitas mt-2 block not-italic text-rosa-texto">
            Virginia Woolf
          </cite>
        </blockquote>
      </footer>
    </div>
  )
}

/**
 * El botón de Ajustes, que también sirve para salir de Ajustes.
 *
 * Estando dentro, vuelve al recetario. Es lo que hace el mismo botón en
 * cualquier aplicación del móvil y lo que se intenta por instinto: se
 * pulsa lo mismo que te trajo para deshacerlo. Antes, dentro de Ajustes,
 * pulsarlo no hacía nada y había que buscar el «Volver al recetario» del
 * final de la página.
 */
function BotonAjustes() {
  const donde = useLocation()
  const dentro = donde.pathname.startsWith('/ajustes')

  return (
    <Link
      to={dentro ? '/' : '/ajustes'}
      aria-label={dentro ? 'Volver al recetario' : 'Ajustes'}
      title={dentro ? 'Volver al recetario' : 'Ajustes'}
      // 44px de lado: el mínimo para acertar con el dedo.
      className={
        'absolute right-3 top-3 flex size-11 items-center justify-center rounded-full border transition-colors sm:right-4 sm:top-4 ' +
        (dentro
          ? 'border-verde-texto bg-verde-texto text-papel'
          : 'border-verde-texto bg-superficie text-verde-texto hover:bg-superficie-2')
      }
    >
      <Engranaje />
    </Link>
  )
}

/**
 * La rueda dentada de siempre.
 *
 * La de antes era la de trazo fino que se lleva ahora: un círculo con
 * ocho palitos alrededor. Se lee como un sol antes que como un
 * engranaje, sobre todo pequeña. Esta tiene dientes de verdad —cuadrados
 * y pegados al aro— y el agujero del centro, que es como se ha dibujado
 * un ajuste toda la vida.
 */
function Engranaje() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6">
      <path
        fill="currentColor"
        fillRule="evenodd"
        // Corona de doce dientes: el aro exterior menos doce muescas,
        // dibujadas como un solo trazo para que no se vean juntas.
        d="M13.3 1.5h-2.6l-.35 2.24a8.6 8.6 0 0 0-1.86.77L6.66 3.14 4.82 4.98l1.37 1.83a8.6 8.6 0 0 0-.77 1.86L3.18 8.9v2.6l2.24.35c.17.66.43 1.28.77 1.86l-1.37 1.83 1.84 1.84 1.83-1.37c.58.34 1.2.6 1.86.77l.35 2.24h2.6l.35-2.24a8.6 8.6 0 0 0 1.86-.77l1.83 1.37 1.84-1.84-1.37-1.83c.34-.58.6-1.2.77-1.86l2.24-.35V8.9l-2.24-.35a8.6 8.6 0 0 0-.77-1.86l1.37-1.83-1.84-1.84-1.83 1.37a8.6 8.6 0 0 0-1.86-.77L13.3 1.5Zm-1.3 5.1a3.6 3.6 0 1 0 0 7.2 3.6 3.6 0 0 0 0-7.2Z"
        transform="translate(0 1.8)"
      />
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
