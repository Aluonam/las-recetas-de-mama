import { useState } from 'react'
import { supabase } from '../nucleo/supabase'
import { useSesion } from '../nucleo/sesion'
import { useFamilia } from '../familias/contexto'
import { HAY_SUPABASE } from '../nucleo/entorno'
import { Aviso } from '../ui/Estado'
import { CampoTexto } from '../ui/Campo'

/**
 * Verificar la cuenta de quien manda en el recetario.
 *
 * Quien crea un recetario es el único que puede borrar recetas. Hasta
 * ahora esa identidad era una sesión anónima que vivía en un navegador:
 * al salir, al borrar el historial o al abrir la app en la tablet, la
 * base ya no te reconocía y perdías el mando de tu propio recetario.
 *
 * Con un correo verificado la identidad deja de depender del navegador.
 * Y es la misma cuenta, no una nueva: el recetario sigue siendo tuyo sin
 * tener que traspasar nada.
 *
 * Solo se le pide a quien manda. Al resto de la familia no se le vuelve a
 * pedir un correo en la vida: entran con el código y ya está.
 */
export function PanelJefe() {
  const { correo, esAnonima } = useSesion()
  const { familia, soyDuena } = useFamilia()

  if (!familia || !HAY_SUPABASE) return null

  if (!soyDuena) {
    return (
      <section className="tarjeta p-4 sm:p-5">
        <h2 className="mb-1 text-xl">Tu acceso</h2>
        <p className="text-tinta-suave">
          Puedes ver y escribir todas las recetas de{' '}
          <strong>{familia.nombre}</strong>. Borrarlas solo puede quien creó
          el recetario.
        </p>
      </section>
    )
  }

  return (
    <section className="tarjeta p-4 sm:p-5">
      <h2 className="mb-1 text-xl">Mandas en este recetario</h2>

      {esAnonima ? (
        <SinVerificar />
      ) : (
        <p className="text-tinta-suave">
          Tu cuenta está verificada como <strong>{correo}</strong>. Puedes
          entrar desde el móvil, la tablet o donde quieras y seguirás siendo
          quien manda aquí.
        </p>
      )}
    </section>
  )
}

function SinVerificar() {
  const [correo, setCorreo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const verificar = async (evento: React.FormEvent) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      // updateUser sobre una sesión anónima le pone correo SIN cambiar de
      // identidad. Por eso el recetario sigue siendo tuyo: eres la misma
      // cuenta de siempre, ahora con una forma de demostrarlo.
      const { error: fallo } = await supabase.auth.updateUser({
        email: correo.trim(),
      })
      if (fallo) throw fallo
      setEnviado(true)
    } catch (e) {
      setError(e)
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div className="rounded-lg border border-verde-texto bg-acento-suave p-4">
        <p className="mb-1 font-semibold">Mira tu correo.</p>
        <p className="text-tinta-suave">
          Te hemos mandado un enlace a <strong>{correo}</strong>. Pincha en él
          y tu cuenta quedará verificada. Hasta entonces sigues mandando aquí
          igual, pero solo desde este navegador.
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="mb-4 text-tinta-suave">
        Pero tu cuenta <strong>no está verificada</strong>, y eso es
        arriesgado: vive solo en este navegador. Si sales, borras el historial
        o abres el recetario en otro dispositivo, dejarás de ser quien manda y
        no podrás borrar recetas.
      </p>

      <form onSubmit={verificar} className="space-y-3">
        <CampoTexto
          etiqueta="Verifica tu cuenta con un correo"
          ayuda="Te llegará un enlace. Es la misma cuenta, no una nueva: el recetario sigue siendo tuyo."
          type="email"
          required
          autoComplete="email"
          placeholder="nombre@correo.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />

        {error != null && <Aviso error={error} />}

        <button type="submit" className="boton-principal" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviarme el enlace de verificación'}
        </button>
      </form>
    </>
  )
}
