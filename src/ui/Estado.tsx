/** Estados de carga y error. Dos componentes tontos, usados en todas partes. */

export function Cargando({ que = 'Cargando' }: { que?: string }) {
  return (
    <p role="status" className="py-12 text-center text-tinta-suave">
      {que}…
    </p>
  )
}

/**
 * Saca el texto de un error, venga como venga.
 *
 * Supabase no lanza objetos Error: lanza objetos planos con `message`
 * dentro. Convertirlos con String() daba «[object Object]», que además de
 * no decir nada tapaba el mensaje de verdad, que sí era útil.
 */
function textoDe(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error

  if (error && typeof error === 'object') {
    const posibles = error as Record<string, unknown>
    // Por orden de utilidad. PostgREST usa message; el login, algunos
    // otros; y hint suele traer la explicación más clara de todas.
    for (const campo of ['message', 'error_description', 'details', 'hint']) {
      const valor = posibles[campo]
      if (typeof valor === 'string' && valor.trim()) return valor.trim()
    }
  }

  return 'Algo ha fallado y no ha dicho por qué. Inténtalo de nuevo.'
}

/**
 * «Failed to fetch» no le dice nada a nadie, y en este proyecto casi
 * siempre significa una de dos cosas concretas: no hay internet, o el
 * proyecto de Supabase está dormido. Vale más decirlo.
 */
function traducir(error: unknown): string {
  const mensaje = textoDe(error)

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
