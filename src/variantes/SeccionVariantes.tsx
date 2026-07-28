import { useCallback, useEffect, useState } from 'react'
import { crearVariante, listarVariantes } from './api'
import type { Variante } from './tipos'
import { Aviso } from '../ui/Estado'
import { CampoArea, CampoTexto } from '../ui/Campo'

/**
 * La misma receta cambia en cada casa. Aquí se apuntan esos cambios sin
 * duplicar la receta entera.
 */
export function SeccionVariantes({ recetaId }: { recetaId: string }) {
  const [variantes, setVariantes] = useState<Variante[]>([])
  const [error, setError] = useState<unknown>(null)
  const [abierto, setAbierto] = useState(false)

  const recargar = useCallback(() => {
    listarVariantes(recetaId).then(setVariantes).catch(setError)
  }, [recetaId])

  useEffect(recargar, [recargar])

  return (
    // Sin línea divisoria: la guirnalda de la ficha ya hace de separador.
    <section className="mt-8">
      <h2 className="mb-1 text-2xl">Cómo la hace cada uno</h2>
      <p className="mb-4 text-tinta-suave">
        La misma receta cambia en cada casa. Aquí se apuntan esos cambios.
      </p>

      {error != null && <Aviso error={error} />}

      <ul className="m-0 mb-4 list-none space-y-4 p-0">
        {variantes.map((variante) => (
          <li key={variante.id} className="tarjeta p-4">
            <h3 className="text-lg">{variante.titulo}</h3>
            <p className="mb-2 text-sm text-acento">{variante.autorNombre}</p>
            <p className="whitespace-pre-line">{variante.texto}</p>
          </li>
        ))}
      </ul>

      {abierto ? (
        <FormularioVariante
          recetaId={recetaId}
          alGuardar={() => {
            setAbierto(false)
            recargar()
          }}
          alCancelar={() => setAbierto(false)}
        />
      ) : (
        <button
          type="button"
          className="boton-secundario w-full sm:w-auto"
          onClick={() => setAbierto(true)}
        >
          Añadir una variante
        </button>
      )}
    </section>
  )
}

function FormularioVariante({
  recetaId,
  alGuardar,
  alCancelar,
}: {
  recetaId: string
  alGuardar: () => void
  alCancelar: () => void
}) {
  const [autorNombre, setAutorNombre] = useState('')
  const [titulo, setTitulo] = useState('')
  const [texto, setTexto] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault()
    setGuardando(true)
    setError(null)
    try {
      await crearVariante(recetaId, { autorNombre, titulo, texto })
      alGuardar()
    } catch (e) {
      setError(e)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="tarjeta space-y-3 p-4">
      <CampoTexto
        etiqueta="¿Quién la hace así?"
        required
        placeholder="Mamá"
        value={autorNombre}
        onChange={(e) => setAutorNombre(e.target.value)}
      />
      <CampoTexto
        etiqueta="Título"
        required
        placeholder="La versión de mamá"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
      />
      <CampoArea
        etiqueta="¿Qué cambia?"
        required
        placeholder="Le pone menos nuez moscada y la deja reposar toda la noche."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />

      {error != null && <Aviso error={error} />}

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="boton-principal" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar variante'}
        </button>
        <button type="button" className="boton-secundario" onClick={alCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
