import { useState } from 'react'
import { crearRecetario, unirseConCodigo } from './api'
import { useFamilia } from './contexto'
import type { Familia } from './tipos'
import { Aviso } from '../ui/Estado'
import { CampoTexto } from '../ui/Campo'

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

      {modo === 'entrar' ? (
        <FormularioEntrar alEntrar={entrar} />
      ) : (
        <FormularioCrear alEntrar={entrar} />
      )}
    </div>
  )
}

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

function FormularioEntrar({
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
    <form onSubmit={enviar} className="tarjeta space-y-4 p-5">
      <CampoCorreo valor={correo} alCambiar={setCorreo} />

      <CampoTexto
        etiqueta="El código de tu familia"
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

function FormularioCrear({
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
    <form onSubmit={enviar} className="tarjeta space-y-4 p-5">
      <CampoCorreo valor={correo} alCambiar={setCorreo} />

      <CampoTexto
        etiqueta="¿Cómo se llama vuestro recetario?"
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

      <p className="text-sm text-tinta-suave">
        Esa contraseña es la llave: pásala a tu familia por WhatsApp y
        entrarán aquí mismo. Se puede cambiar cuando quieras.
      </p>

      {error != null && <Aviso error={error} />}

      <button type="submit" className="boton-principal w-full" disabled={enviando}>
        {enviando ? 'Creando…' : 'Crear el recetario'}
      </button>
    </form>
  )
}
