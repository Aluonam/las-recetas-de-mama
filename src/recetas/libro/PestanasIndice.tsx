interface Props {
  /** Por qué hoja se abre cada letra, en orden. */
  comienzos: Map<string, number>
  letraAbierta: string
  alElegir: (hoja: number) => void
}

/**
 * El índice, troquelado en el canto del libro.
 *
 * Como las agendas de teléfonos de toda la vida: unas lengüetas de
 * cartulina asomando por el lateral, con la letra escrita, y metes el
 * dedo por la que buscas.
 *
 * Cada una lleva al principio de su letra, que no siempre es una receta:
 * donde hay varias, lleva a la hoja de índice de esa letra, y desde allí
 * se elige. Así una T con seis recetas es una pestaña y un toque, en vez
 * de seis hojas mirando títulos.
 *
 * Solo salen las letras que tienen recetas. Un cajón vacío en una agenda
 * es un cajón, pero aquí sería un botón que no lleva a ninguna parte.
 *
 * Se esconde cuando solo cabe una página: allí las lengüetas se comerían
 * el texto, y para buscar está la lista.
 */
export function PestanasIndice({ comienzos, letraAbierta, alElegir }: Props) {
  const letras = [...comienzos.entries()]

  if (letras.length < 2) return null

  return (
    <nav aria-label="Índice del recetario" className="pestanas solo-con-dos-flex">
      {letras.map(([letra, hoja]) => {
        const esta = letra === letraAbierta
        return (
          <button
            key={letra}
            type="button"
            onClick={() => alElegir(hoja)}
            aria-current={esta ? 'true' : undefined}
            title={`Ir a la ${letra}`}
            className={'pestana' + (esta ? ' pestana-abierta' : '')}
          >
            {letra}
          </button>
        )
      })}
    </nav>
  )
}
