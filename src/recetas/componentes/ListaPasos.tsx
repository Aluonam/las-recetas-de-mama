import type { Paso } from '../tipos'

export function ListaPasos({ pasos }: { pasos: Paso[] }) {
  if (pasos.length === 0) return null

  return (
    <section>
      <h2 className="mb-5 text-2xl">Cómo se hace</h2>

      <ol className="m-0 list-none space-y-6 p-0">
        {pasos.map((paso, indice) => (
          <li key={paso.id} className="flex gap-3 sm:gap-4">
            <span
              aria-hidden="true"
              className="ficha-azulejo flex size-9 shrink-0 items-center justify-center bg-verde-texto text-sm font-bold text-white"
            >
              {indice + 1}
            </span>

            <div className="min-w-0">
              <p className="whitespace-pre-line">{paso.texto}</p>
              {paso.fotoUrl && (
                <img
                  src={paso.fotoUrl}
                  alt=""
                  loading="lazy"
                  className="mt-2 w-full max-w-sm rounded-lg"
                />
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
