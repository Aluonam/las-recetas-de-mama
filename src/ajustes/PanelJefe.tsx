import { useState } from 'react'
import { supabase } from '../nucleo/supabase'
import { useSesion } from '../nucleo/sesion'
import { useFamilia } from '../familias/contexto'
import { HAY_SUPABASE } from '../nucleo/entorno'
import { Aviso } from '../ui/Estado'
import { CampoTexto } from '../ui/Campo'

/**
 * Identificarse como quien administra el recetario.
 *
 * Todo el mundo entra igual: con el código y sin correos. Quien
 * administra se identifica después, aquí, y solo si le hace falta.
 *
 * Por debajo son dos situaciones distintas, pero desde fuera es un solo
 * botón:
 *
 * - En el navegador donde se creó el recetario, la cuenta es anónima y
 *   ya manda. El correo la ancla, sin cambiar de identidad, para que
 *   deje de depender de este navegador.
 * - En cualquier otro sitio, el correo devuelve a esa cuenta anclada.
 *
 * En los dos casos el resultado es el mismo: pinchas el enlace y
 * apareces como administradora, con los botones de borrar.
 */
export function PanelJefe() {
  const { correo, esAnonima } = useSesion()
  const { familia, soyDuena } = useFamilia()

  if (!familia || !HAY_SUPABASE) return null

  if (!esAnonima) {
    return (
      <section className="tarjeta p-4 sm:p-5">
        <h2 className="mb-1 text-xl">
          {soyDuena ? 'Mandas en este recetario' : 'Tu cuenta está verificada'}
        </h2>
        <p className="text-tinta-suave">
          Verificada como <strong>{correo}</strong>.{' '}
          {soyDuena
            ? 'Entres desde donde entres, seguirás siendo quien administra.'
            : `Puedes ver y escribir en ${familia.nombre}, pero borrar recetas solo puede quien lo creó.`}
        </p>
      </section>
    )
  }

  return <Identificarse soyDuena={soyDuena} />
}

function Identificarse({ soyDuena }: { soyDuena: boolean }) {
  const [correo, setCorreo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)

    try {
      if (soyDuena) {
        /**
         * Esta cuenta ya manda, pero es anónima y vive en este navegador.
         * updateUser le pone correo SIN cambiar de identidad: sigue siendo
         * la misma cuenta, así que el recetario no se traspasa a nadie.
         */
        const { error: fallo } = await supabase.auth.updateUser({
          email: correo.trim(),
        })
        if (fallo) throw fallo
      } else {
        /**
         * Aquí manda otra cuenta, así que hay que volver a la de siempre.
         *
         * shouldCreateUser en false a propósito: sin eso, escribir un
         * correo nunca usado crearía una cuenta nueva, que tampoco
         * administraría nada, y el mensaje de «ya estás dentro» sería
         * mentira.
         */
        const { error: fallo } = await supabase.auth.signInWithOtp({
          email: correo.trim(),
          options: {
            shouldCreateUser: false,
            emailRedirectTo: window.location.origin + '/ajustes',
          },
        })
        if (fallo) throw fallo
      }

      setEnviado(true)
    } catch (e) {
      setError(e)
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <section className="tarjeta p-4 sm:p-5">
        <h2 className="mb-1 text-xl">Mira tu correo</h2>
        <p className="text-tinta-suave">
          Te hemos mandado un enlace a <strong>{correo}</strong>. Pincha en él
          y volverás aquí como administradora, con los botones para borrar
          recetas.
        </p>
      </section>
    )
  }

  return (
    <section className="tarjeta p-4 sm:p-5">
      <h2 className="mb-1 text-xl">¿Administras este recetario?</h2>
      <p className="mb-4 text-tinta-suave">
        {soyDuena
          ? 'Lo administras desde este navegador, pero tu cuenta no está ' +
            'verificada: si sales, borras el historial o abres el recetario ' +
            'en la tablet, dejarás de mandar. Verifícala con tu correo y eso ' +
            'deja de pasar.'
          : 'Si eres quien lo creó, identifícate con tu correo y recuperarás ' +
            'los botones para borrar recetas. Si no, no necesitas hacer nada: ' +
            'ya puedes ver y escribir todo.'}
      </p>

      <form onSubmit={enviar} className="space-y-3">
        <CampoTexto
          etiqueta="Tu correo"
          ayuda={
            soyDuena
              ? 'Es la misma cuenta, no una nueva: el recetario sigue siendo tuyo.'
              : 'El mismo con el que verificaste tu cuenta en su día.'
          }
          type="email"
          required
          autoComplete="email"
          placeholder="nombre@correo.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        {error != null && <Aviso error={error} />}

        <button type="submit" className="boton-principal" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviarme el enlace'}
        </button>
      </form>
    </section>
  )
}
