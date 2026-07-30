import { useState } from 'react'
import { cambiarCodigo, establecerCodigo } from './api'
import { useFamilia } from './contexto'
import { Aviso } from '../ui/Estado'
import { CampoTexto } from '../ui/Campo'

/**
 * El código del recetario, para compartirlo y para cambiarlo.
 *
 * Va en la portada y a la vista: es lo que hay que enseñar cuando alguien
 * pregunta «¿y cómo entro yo?». Escondido en unos ajustes obligaría a
 * explicárselo cada vez.
 */
export function PanelCodigo() {
  const { familia, entrar } = useFamilia()
  const [copiado, setCopiado] = useState(false)
  const [cambiando, setCambiando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [error, setError] = useState<unknown>(null)

  if (!familia) return null

  const invitacion =
    `Te paso el recetario de la familia: ${window.location.origin}\n` +
    `Entra con tu correo y luego pon este código: ${familia.codigo}`

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(invitacion)
      setCopiado(true)
      window.setTimeout(() => setCopiado(false), 2500)
    } catch {
      setError(
        new Error(
          'El navegador no ha dejado copiar. Selecciona el código a mano.',
        ),
      )
    }
  }

  const regenerar = async () => {
    const seguro = window.confirm(
      'Se generará un código nuevo y el actual dejará de funcionar.\n\n' +
        'Quien ya entró sigue dentro. Hazlo solo si el código se ha ' +
        'difundido más de la cuenta.',
    )
    if (!seguro) return

    setCambiando(true)
    setError(null)
    try {
      const nuevo = await cambiarCodigo(familia.id)
      entrar({ ...familia, codigo: nuevo })
    } catch (e) {
      setError(e)
    } finally {
      setCambiando(false)
    }
  }

  return (
    <section className="tarjeta mt-16 p-4 sm:p-5">
      <h2 className="mb-1 text-xl">Invitar a la familia</h2>
      <p className="mb-4 text-tinta-suave">
        Quien tenga este código entra en <strong>{familia.nombre}</strong>.
        Pásaselo por WhatsApp y listo.
      </p>

      <p className="mb-4 rounded-lg border border-borde bg-superficie px-4 py-3 text-center font-titulo text-2xl tracking-wider text-verde-texto">
        {familia.codigo}
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="boton-principal" onClick={copiar}>
          {copiado ? 'Copiado ✓' : 'Copiar invitación'}
        </button>
        <button
          type="button"
          className="boton-secundario"
          onClick={() => setEditando((antes) => !antes)}
        >
          Elegir otro código
        </button>
        <button
          type="button"
          className="boton-secundario"
          onClick={regenerar}
          disabled={cambiando}
        >
          {cambiando ? 'Generando…' : 'Generar uno al azar'}
        </button>
      </div>

      {editando && (
        <FormularioCodigo
          familiaId={familia.id}
          alCambiar={(nuevo) => {
            entrar({ ...familia, codigo: nuevo })
            setEditando(false)
          }}
        />
      )}

      {error != null && (
        <div className="mt-3">
          <Aviso error={error} />
        </div>
      )}
    </section>
  )
}

function FormularioCodigo({
  familiaId,
  alCambiar,
}: {
  familiaId: string
  alCambiar: (codigo: string) => void
}) {
  const [codigo, setCodigo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<unknown>(null)

  // Un código corto y sin números se adivina. Se avisa, no se prohíbe:
  // la decisión es de quien lo va a repartir.
  const flojo = codigo.trim().length >= 5 && !/\d/.test(codigo)

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault()
    setGuardando(true)
    setError(null)
    try {
      alCambiar(await establecerCodigo(familiaId, codigo))
    } catch (e) {
      setError(e)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="mt-4 space-y-3 border-t border-borde pt-4">
      <CampoTexto
        etiqueta="El código que quieras"
        ayuda="Entre 5 y 32 caracteres. Letras sin tilde, números y guiones."
        required
        autoCapitalize="characters"
        autoComplete="off"
        placeholder="ROGELIO24"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
      />

      {flojo && (
        <p className="text-sm text-tinta-suave">
          Este código es una palabra sola. Es lo único que separa vuestras
          recetas del resto de internet, así que añadirle un número lo hace
          mucho más difícil de adivinar.
        </p>
      )}

      {error != null && <Aviso error={error} />}

      <button type="submit" className="boton-principal" disabled={guardando}>
        {guardando ? 'Guardando…' : 'Poner este código'}
      </button>
    </form>
  )
}
