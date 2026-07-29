/** Estados de carga y error. Dos componentes tontos, usados en todas partes. */

export function Cargando({ que = 'Cargando' }: { que?: string }) {
  return (
    <p role="status" className="py-12 text-center text-tinta-suave">
      {que}…
    </p>
  )
}

/**
 * «Failed to fetch» no le dice nada a nadie, y en este proyecto casi
 * siempre significa una de dos cosas concretas: no hay internet, o el
 * proyecto de Supabase está dormido. Vale más decirlo.
 */
function traducir(error: unknown): string {
  const mensaje = error instanceof Error ? error.message : String(error)

  const pareceDeRed =
    /failed to fetch|networkerror|load failed|fetch failed/i.test(mensaje)

  if (pareceDeRed) {
    return navigator.onLine
      ? 'No se ha podido conectar con el recetario. Puede que el servidor ' +
          'esté dormido por no usarse: entra al panel de Supabase y ' +
          'reactívalo, o inténtalo de nuevo en un par de minutos.'
      : 'No hay conexión. Las recetas que ya has abierto siguen ' +
          'disponibles; las demás volverán al recuperar internet.'
  }

  return mensaje
}

export function Aviso({ error }: { error: unknown }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-acento bg-acento-suave px-4 py-3 text-tinta"
    >
      {traducir(error)}
    </p>
  )
}
