import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../nucleo/supabase'
import { useSesion } from '../nucleo/sesion'
import { Aviso, Cargando } from '../ui/Estado'
import { CampoTexto } from '../ui/Campo'

/**
 * Entrada por enlace mágico: no hay contraseñas que recordar.
 * Con usuarias de 80 años, cada contraseña es una puerta cerrada.
 */
export function PaginaEntrar() {
  const { sesion, cargando } = useSesion()
  const [correo, setCorreo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState<unknown>(null)

  if (cargando) return <Cargando que="Abriendo el recetario" />
  if (sesion) return <Navigate to="/" replace />

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: correo.trim(),
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) throw error
      setEnviado(true)
    } catch (e) {
      setError(e)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-2 text-3xl sm:text-4xl">Las Recetas de Mamá</h1>
      <p className="mb-8 text-tinta-suave">
        El recetario de la familia. Escribe tu correo y te mandamos un enlace
        para entrar.
      </p>

      {enviado ? (
        <div className="tarjeta p-5">
          <p className="mb-2 font-semibold">Mira tu correo.</p>
          <p className="text-tinta-suave">
            Te hemos enviado un enlace a <strong>{correo}</strong>. Pincha en él
            y entrarás directamente.
          </p>
        </div>
      ) : (
        <form onSubmit={enviar} className="flex flex-col gap-4">
          <CampoTexto
            etiqueta="Tu correo"
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
      )}
    </div>
  )
}
