/** Estados de carga y error. Dos componentes tontos, usados en todas partes. */

export function Cargando({ que = 'Cargando' }: { que?: string }) {
  return (
    <p role="status" className="py-12 text-center text-tinta-suave">
      {que}…
    </p>
  )
}

export function Aviso({ error }: { error: unknown }) {
  const mensaje = error instanceof Error ? error.message : String(error)
  return (
    <p
      role="alert"
      className="rounded-lg border border-acento bg-acento-suave px-4 py-3 text-tinta"
    >
      {mensaje}
    </p>
  )
}
