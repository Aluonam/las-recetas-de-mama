import { useEffect, useState } from 'react'
import { correoDelAdministrador } from '../familias/api'
import { useFamilia } from '../familias/contexto'

/**
 * Avisar a quien administra el recetario.
 *
 * Hace falta porque no todo el mundo puede hacerlo todo: borrar una
 * receta es solo de quien creó el recetario. Sin una forma de avisarle,
 * quien suba algo por error se queda sin salida.
 *
 * Abre el programa de correo con el asunto puesto. No enviamos nada
 * nosotros: montar envío de correos sería otro servicio, otra clave y
 * otra cosa que mantener, para un mensaje que se manda dos veces al año.
 */
export function EscribirAlAdministrador() {
  const { familia, soyDuena } = useFamilia()
  const [correo, setCorreo] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (!familia || soyDuena) {
      setCargando(false)
      return
    }

    let vigente = true
    correoDelAdministrador(familia.id)
      .then((suyo) => {
        if (vigente) setCorreo(suyo)
      })
      // Si no se puede averiguar, sencillamente no se ofrece escribir.
      .catch(() => {})
      .finally(() => {
        if (vigente) setCargando(false)
      })

    return () => {
      vigente = false
    }
  }, [familia, soyDuena])

  if (!familia) return null

  if (soyDuena) {
    return (
      <section className="tarjeta p-4 sm:p-5">
        <h2 className="mb-1 text-xl">Tú administras este recetario</h2>
        <p className="text-tinta-suave">
          Eres quien puede borrar recetas y cambiar el código. Si alguien de
          la familia necesita algo, te escribirá desde aquí.
        </p>
      </section>
    )
  }

  const asunto = `Recetario «${familia.nombre}»`
  const cuerpo =
    `Hola:\n\nTe escribo por el recetario «${familia.nombre}».\n\n`

  return (
    <section className="tarjeta p-4 sm:p-5">
      <h2 className="mb-1 text-xl">¿Necesitas algo?</h2>
      <p className="mb-4 text-tinta-suave">
        Borrar una receta solo puede hacerlo quien creó el recetario. Si has
        subido algo por error o quieres pedir cualquier otra cosa, avísale.
      </p>

      {cargando ? (
        <p role="status" className="text-tinta-suave">
          Buscando a quién escribir…
        </p>
      ) : correo ? (
        <a
          className="boton-principal no-underline"
          href={`mailto:${correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`}
        >
          Escribir a {correo}
        </a>
      ) : (
        <p className="text-tinta-suave">
          Quien creó este recetario no dejó ningún correo, así que desde aquí
          no se le puede avisar. Pregúntale por WhatsApp.
        </p>
      )}
    </section>
  )
}
