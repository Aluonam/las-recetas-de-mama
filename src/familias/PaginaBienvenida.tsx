import { useState } from 'react'
import { crearRecetario, unirseConCodigo } from './api'
import { useFamilia } from './contexto'
import { Aviso } from '../ui/Estado'
import { CampoTexto } from '../ui/Campo'

/**
 * Primera pantalla de quien todavía no pertenece a ningún recetario.
 *
 * Dos caminos y nada más: crear el de tu casa, o entrar en uno con el
 * código que te han pasado. Quien llega aquí suele venir de un WhatsApp
 * con un código dentro, así que esa opción va primero.
 */
export function PaginaBienvenida() {
  const { entrar } = useFamilia()
  const [modo, setModo] = useState<'entrar' | 'crear'>('entrar')

  return (
    <div className="mx-auto max-w-lg py-8">
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
          Tengo un código
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
        <FormularioCodigo alEntrar={entrar} />
      ) : (
        <FormularioCrear alEntrar={entrar} />
      )}
    </div>
  )
}

function FormularioCodigo({
  alEntrar,
}: {
  alEntrar: (familia: import('./tipos').Familia) => void
}) {
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      alEntrar(await unirseConCodigo(codigo))
    } catch (e) {
      setError(e)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="tarjeta space-y-4 p-5">
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
  alEntrar: (familia: import('./tipos').Familia) => void
}) {
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      alEntrar(await crearRecetario(nombre, codigo))
    } catch (e) {
      setError(e)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="tarjeta space-y-4 p-5">
      <CampoTexto
        etiqueta="¿Cómo se llama vuestro recetario?"
        ayuda="El nombre que le pondríais en casa. Se puede cambiar luego."
        required
        placeholder="Las recetas de los Cano"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <CampoTexto
        etiqueta="El código para entrar (opcional)"
        ayuda="Déjalo vacío y se genera uno. Entre 5 y 32 caracteres: letras sin tilde, números y guiones."
        autoCapitalize="characters"
        autoComplete="off"
        placeholder="ROGELIO24"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />

      <p className="text-sm text-tinta-suave">
        Ese código es la llave: pásalo a tu familia por WhatsApp y entrarán
        aquí mismo. Se puede cambiar cuando quieras.
      </p>

      {error != null && <Aviso error={error} />}

      <button type="submit" className="boton-principal w-full" disabled={enviando}>
        {enviando ? 'Creando…' : 'Crear el recetario'}
      </button>
    </form>
  )
}
