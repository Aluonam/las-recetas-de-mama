import { useState } from 'react'
import { useFamilia } from './contexto'
import { FormularioCrear, FormularioEntrar } from './Formularios'

/**
 * La primera y única pantalla antes de entrar.
 *
 * Sin enlaces al correo ni esperas: se escribe el correo, el código
 * familiar, y se entra. El correo queda anotado para saber quién metió
 * cada receta; la llave es el código.
 *
 * «Ya tengo código» va primero porque casi todo el mundo llega aquí
 * desde un WhatsApp con un código dentro. Crear recetario lo hace una
 * persona por familia, una sola vez.
 *
 * Aquí no hay nada de administradoras a propósito: todo el mundo entra
 * igual. Quien administra se identifica después, desde Ajustes.
 */
export function PaginaBienvenida() {
  const { entrar } = useFamilia()
  const [modo, setModo] = useState<'entrar' | 'crear'>('entrar')

  return (
    <div className="mx-auto max-w-lg py-6">
      <div className="guirnalda mb-4" aria-hidden="true" />

      <h1 className="mb-3 text-center text-3xl sm:text-4xl">
        Las Recetas de Mamá
      </h1>
      <p className="mb-8 text-center text-tinta-suave">
        Cada familia tiene su recetario. Entra en el tuyo con el código que
        te hayan pasado, o empieza uno nuevo.
      </p>

      <div className="solapas mb-6 justify-center">
        <button
          type="button"
          onClick={() => setModo('entrar')}
          aria-pressed={modo === 'entrar'}
          className={'solapa' + (modo === 'entrar' ? ' solapa-activa' : '')}
        >
          Ya tengo código
        </button>
        <button
          type="button"
          onClick={() => setModo('crear')}
          aria-pressed={modo === 'crear'}
          className={'solapa' + (modo === 'crear' ? ' solapa-activa' : '')}
        >
          Crear uno nuevo
        </button>
      </div>

      <div className="tarjeta p-5">
        {modo === 'entrar' ? (
          <FormularioEntrar alEntrar={entrar} />
        ) : (
          <FormularioCrear alEntrar={entrar} />
        )}
      </div>
    </div>
  )
}
