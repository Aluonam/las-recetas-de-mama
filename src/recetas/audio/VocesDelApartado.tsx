import type { Apartado, AudioApartado } from '../tipos'
import { ReproductorAudio } from './ReproductorAudio'

/**
 * Las notas de voz de un apartado, al leer la receta.
 *
 * Van pegadas debajo de lo que explican, no todas juntas al final. Un
 * aviso sobre las manzanas puesto entre los ingredientes se oye cuando
 * hace falta; el mismo aviso en una lista de audios al pie de la
 * página no lo oye nadie.
 *
 * Si no hay ninguna no se pinta nada, ni un título ni un hueco: la
 * mayoría de las recetas no van a tenerlas.
 */
export function VocesDelApartado({
  apartado,
  audios,
}: {
  apartado: Apartado
  audios: AudioApartado[]
}) {
  const suyos = audios.filter((audio) => audio.apartado === apartado)
  if (suyos.length === 0) return null

  return (
    <div className="mt-4 space-y-3 border-l-4 border-rosa-medio pl-4">
      <p className="versalitas text-rosa-texto">Escúchalo</p>

      {suyos.map((audio) => (
        <div key={audio.id}>
          {audio.nota?.trim() && (
            <p className="mb-1 font-titulo italic text-tinta-suave">
              {audio.nota.trim()}
            </p>
          )}
          <ReproductorAudio url={audio.url} />
        </div>
      ))}
    </div>
  )
}
