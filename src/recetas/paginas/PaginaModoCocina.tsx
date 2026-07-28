import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obtenerReceta } from '../api'
import type { Receta } from '../tipos'
import { textoCantidad } from '../formato'
import { Aviso, Cargando } from '../../ui/Estado'
import { ListaTrucos } from '../componentes/ListaTrucos'
import { usePantallaEncendida } from './usePantallaEncendida'

/**
 * Modo cocina: se lee de pie, a un metro y con las manos pringadas.
 * Texto grande, pasos que se tachan de un toque y pantalla que no se apaga.
 */
export function PaginaModoCocina() {
  const { id } = useParams<{ id: string }>()
  const [receta, setReceta] = useState<Receta | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [hechos, setHechos] = useState<Set<string>>(new Set())

  usePantallaEncendida()

  useEffect(() => {
    if (!id) return
    obtenerReceta(id).then(setReceta).catch(setError)
  }, [id])

  const alternar = (idPaso: string) => {
    setHechos((previos) => {
      const siguiente = new Set(previos)
      if (siguiente.has(idPaso)) siguiente.delete(idPaso)
      else siguiente.add(idPaso)
      return siguiente
    })
  }

  if (error != null) return <Aviso error={error} />
  if (!receta) return <Cargando que="Preparando la cocina" />

  return (
    <div className="modo-cocina min-h-svh bg-papel">
      <header className="sticky top-0 z-10 border-b border-borde bg-superficie/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
          <h1 className="min-w-0 flex-1 truncate text-xl sm:text-2xl">
            {receta.titulo}
          </h1>
          <Link
            to={`/receta/${receta.id}`}
            className="boton-secundario shrink-0 no-underline"
          >
            Salir
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <section className="tarjeta mb-8 p-4 sm:p-5">
          <h2 className="mb-3 text-xl">Lo que necesitas</h2>

          <ul className="m-0 list-none space-y-2 p-0">
            {receta.ingredientes.map((ingrediente) => (
              <li key={ingrediente.id} className="flex flex-wrap gap-x-3">
                <span className="font-semibold text-acento sm:min-w-36">
                  {textoCantidad(ingrediente) || '—'}
                </span>
                <span>{ingrediente.nombre}</span>
              </li>
            ))}
          </ul>

          {receta.materiales.length > 0 && (
            <p className="mt-4 border-t border-borde pt-4 text-tinta-suave">
              <strong>Cacharros:</strong>{' '}
              {receta.materiales.map((material) => material.nombre).join(', ')}
            </p>
          )}
        </section>

        <ol className="m-0 list-none space-y-4 p-0">
          {receta.pasos.map((paso, indice) => (
            <PasoCocina
              key={paso.id}
              numero={indice + 1}
              texto={paso.texto}
              hecho={hechos.has(paso.id)}
              alTocar={() => alternar(paso.id)}
            />
          ))}
        </ol>

        <div className="mt-8">
          <ListaTrucos trucos={receta.trucos} destacado />
        </div>
      </div>
    </div>
  )
}

function PasoCocina({
  numero,
  texto,
  hecho,
  alTocar,
}: {
  numero: number
  texto: string
  hecho: boolean
  alTocar: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={alTocar}
        aria-pressed={hecho}
        className={
          'tarjeta flex w-full items-start gap-4 p-4 text-left transition-opacity sm:p-5 ' +
          (hecho ? 'opacity-45' : '')
        }
      >
        <span
          aria-hidden="true"
          className={
            'flex size-10 shrink-0 items-center justify-center rounded-full border-2 text-base font-bold ' +
            (hecho
              ? 'border-exito bg-exito text-papel'
              : 'border-borde text-tinta-suave')
          }
        >
          {hecho ? '✓' : numero}
        </span>
        <span className={hecho ? 'line-through' : ''}>{texto}</span>
      </button>
    </li>
  )
}
