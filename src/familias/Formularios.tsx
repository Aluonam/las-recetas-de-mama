import { useState } from 'react'
import { crearRecetario, unirseConCodigo } from './api'
import type { Familia } from './tipos'
import { Aviso } from '../ui/Estado'
import { CampoTexto } from '../ui/Campo'

/**
 * Entrar en un recetario o crear uno.
 *
 * Están aquí y no dentro de la bienvenida porque hacen falta en dos
 * sitios: la primera vez que alguien llega, y después desde Ajustes para
 * añadir otro. Una persona puede tener varios —el de su casa y el de sus
 * suegros— y no debería tener que salirse para cambiar.
 */

/** Campo de correo, igual en los dos formularios. */
function CampoCorreo({
  valor,
  alCambiar,
}: {
  valor: string
  alCambiar: (correo: string) => void
}) {
  return (
    <CampoTexto
      etiqueta="Tu correo"
      ayuda="Solo para saber quién ha escrito cada receta. No te vamos a mandar nada."
      type="email"
      required
      autoComplete="email"
      placeholder="nombre@correo.com"
      value={valor}
      onChange={(e) => alCambiar(e.target.value)}
    />
  )
}

export function FormularioEntrar({
  alEntrar,
}: {
  alEntrar: (familia: Familia) => void
}) {
  const [correo, setCorreo] = useState('')
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      alEntrar(await unirseConCodigo(codigo, correo))
    } catch (e) {
      setError(e)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <CampoCorreo valor={correo} alCambiar={setCorreo} />

      <CampoTexto
        etiqueta="El código de esa familia"
        ayuda="Te lo habrán pasado por WhatsApp. Da igual mayúsculas o minúsculas."
        required
        autoCapitalize="characters"
        autoComplete="off"
        placeholder="MEMBRILLO-4821"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />

      {error != null && <Aviso error={error} />}

      <button type="submit" className="boton-principal w-full" disabled={enviando}>
        {enviando ? 'Entrando…' : 'Entrar en el recetario'}
      </button>
    </form>
  )
}

export function FormularioCrear({
  alEntrar,
}: {
  alEntrar: (familia: Familia) => void
}) {
  const [correo, setCorreo] = useState('')
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<unknown>(null)

  // Una palabra suelta se adivina. Se avisa, no se prohíbe.
  const flojo = codigo.trim().length >= 5 && !/\d/.test(codigo)

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      alEntrar(await crearRecetario(nombre, codigo, correo))
    } catch (e) {
      setError(e)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <CampoCorreo valor={correo} alCambiar={setCorreo} />

      <CampoTexto
        etiqueta="¿Cómo se llama el recetario?"
        ayuda="El nombre que le pondríais en casa."
        required
        placeholder="Las recetas de los Cano"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <CampoTexto
        etiqueta="La contraseña familiar"
        ayuda="Entre 5 y 32 caracteres: letras sin tilde, números y guiones. Déjala vacía y se genera una."
        autoCapitalize="characters"
        autoComplete="off"
        placeholder="ROGELIO162"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />

      {flojo && (
        <p className="text-sm text-tinta-suave">
          Es una palabra sola. Añadirle un número la hace mucho más difícil
          de adivinar, y sigue siendo igual de fácil de dictar.
        </p>
      )}

      {error != null && <Aviso error={error} />}

      <button type="submit" className="boton-principal w-full" disabled={enviando}>
        {enviando ? 'Creando…' : 'Crear el recetario'}
      </button>
    </form>
  )
}
