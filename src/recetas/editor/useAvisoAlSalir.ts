import { useEffect } from 'react'

/**
 * El aviso del navegador al cerrar con algo a medias.
 *
 * Es la última red, la que salta cuando fallan las otras: cerrar la
 * pestaña, recargar, o irse a otra dirección. El borrador cubre casi
 * todo, pero en una ventana privada no hay dónde guardarlo, y ahí esto
 * es lo único que queda.
 *
 * El texto lo pone el navegador y no se puede cambiar: hace años que
 * dejaron de hacer caso al que se escribiera, porque se usaba para
 * asustar. Solo se puede decidir si sale o no, y sale únicamente cuando
 * hay algo escrito que se perdería.
 */
export function useAvisoAlSalir(hayAlgoQuePerder: boolean) {
  useEffect(() => {
    if (!hayAlgoQuePerder) return

    const avisar = (evento: BeforeUnloadEvent) => {
      evento.preventDefault()
      // Los navegadores viejos piden que se devuelva algo para enseñarlo.
      evento.returnValue = ''
    }

    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [hayAlgoQuePerder])
}
