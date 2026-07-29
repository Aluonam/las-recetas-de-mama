import { useState } from 'react'
import { useInstalacion } from './useInstalacion'

const CLAVE_DESCARTADO = 'instalacion-descartada'

function estabaDescartado(): boolean {
  try {
    return localStorage.getItem(CLAVE_DESCARTADO) === 'si'
  } catch {
    return false
  }
}

/**
 * Invitación a poner el recetario en la pantalla de inicio.
 *
 * Aparece una vez y se puede quitar para siempre: nadie quiere que una
 * app le insista cada vez que abre una receta.
 */
export function AvisoInstalar() {
  const { instalada, sePuedeInstalar, hayQueExplicar, instalar } = useInstalacion()
  const [descartado, setDescartado] = useState(estabaDescartado)

  if (instalada || descartado) return null
  if (!sePuedeInstalar && !hayQueExplicar) return null

  const descartar = () => {
    setDescartado(true)
    try {
      localStorage.setItem(CLAVE_DESCARTADO, 'si')
    } catch {
      // Ventana privada: se volverá a ofrecer. Tampoco es grave.
    }
  }

  return (
    <aside className="tarjeta mb-8 p-4 sm:p-5">
      <h2 className="mb-1 text-xl">Tenlo a mano</h2>

      {sePuedeInstalar ? (
        <p className="mb-4 text-tinta-suave">
          Puedes añadir el recetario a la pantalla de inicio y abrirlo como
          cualquier otra aplicación, sin escribir direcciones. Funciona
          también sin conexión.
        </p>
      ) : (
        <div className="mb-4 text-tinta-suave">
          <p className="mb-2">
            Para tenerlo como una aplicación más en la pantalla de inicio:
          </p>
          <ol className="m-0 list-decimal space-y-1 pl-5">
            <li>
              Toca el botón <strong>Compartir</strong> de Safari, el del
              cuadrado con la flecha hacia arriba.
            </li>
            <li>
              Baja y elige <strong>Añadir a pantalla de inicio</strong>.
            </li>
            <li>
              Toca <strong>Añadir</strong>.
            </li>
          </ol>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {sePuedeInstalar && (
          <button type="button" className="boton-principal" onClick={instalar}>
            Añadir a la pantalla de inicio
          </button>
        )}
        <button type="button" className="boton-secundario" onClick={descartar}>
          Ahora no
        </button>
      </div>
    </aside>
  )
}
