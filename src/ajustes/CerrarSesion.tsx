import { useState } from 'react'
import { useSesion } from '../nucleo/sesion'
import { HAY_SUPABASE } from '../nucleo/entorno'
import { Confirmar } from '../ui/Confirmar'

/**
 * Cerrar sesión.
 *
 * Estaba en la cabecera, en una esquina, y ahí no pintaba nada: se usa
 * una vez al año y compartía sitio con lo que se toca a diario. Peor
 * aún, es lo único de la pantalla que cuesta deshacer —para volver hay
 * que tener a mano el código de la familia—, así que tenerlo a un dedo
 * del botón de escribir una receta era pedir un disgusto.
 *
 * Va al final de Ajustes, que es donde se ponen las cosas que se hacen
 * una vez y hay que pensárselas. Y avisa antes, por si acaso.
 */
export function CerrarSesion() {
  const { salir } = useSesion()
  const [preguntando, setPreguntando] = useState(false)

  // En modo demostración no hay sesión que cerrar: las recetas viven en
  // este navegador y no hay código con el que volver a entrar.
  if (!HAY_SUPABASE) return null

  return (
    <section className="border-t border-borde pt-8">
      {preguntando && (
        <Confirmar
          peligroso
          titulo="¿Cerrar la sesión?"
          detalle="Para volver a entrar tendrás que escribir de nuevo el código de tu familia. Si no lo tienes a mano, pídeselo a quien te lo pasó."
          textoSi="Sí, cerrar sesión"
          textoNo="No, quedarme"
          alSi={salir}
          alNo={() => setPreguntando(false)}
        />
      )}

      <button
        type="button"
        onClick={() => setPreguntando(true)}
        className="mx-auto block rounded-md border border-borde bg-superficie px-4 py-2 text-sm font-semibold text-tinta-suave transition-colors hover:bg-superficie-2"
      >
        Cerrar sesión
      </button>

      <p className="mt-3 text-center text-sm text-tinta-suave">
        Para volver a entrar te hará falta el código de la familia.
      </p>
    </section>
  )
}
