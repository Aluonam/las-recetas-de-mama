import { useEffect, useRef } from 'react'

/**
 * Abre algo a pantalla completa, dejando la cabecera justo encima.
 *
 * La cabecera no se esconde ni se quita: sigue donde estaba, y lo que se
 * hace es colocar la página con el libro —o la receta— llenando la
 * pantalla. Deslizas hacia abajo y vuelve a aparecer, con todos sus
 * botones, sin gestos nuevos que aprender.
 *
 * Se prefirió esto a una barra que se esconde y aparece sola: aquella
 * hay que programarla, se equivoca, y en una tablet acaba dando saltos
 * mientras lees. Aquí el navegador ya sabe desplazarse; solo se le dice
 * por dónde empezar.
 *
 * El desplazamiento es suave a propósito. Ver la cabecera irse es lo que
 * te enseña que sigue ahí arriba: si apareciera ya colocado, parecería
 * que ha desaparecido y nadie iría a buscarla.
 *
 * Hay que decirle el tipo de elemento al llamarlo —`useAbrirEnGrande<
 * HTMLDivElement>(…)`—: no se deduce de nada, porque no llega por los
 * argumentos sino por dónde se enganche el `ref`.
 */
export function useAbrirEnGrande<T extends HTMLElement>(activo: boolean) {
  const zona = useRef<T>(null)

  /**
   * Si quien lee sigue donde lo dejamos o se ha ido por su cuenta.
   *
   * Mientras no se haya movido, la colocación es cosa nuestra y hay que
   * rehacerla cuando cambia la pantalla. En cuanto se mueve, deja de
   * serlo: recolocar a alguien que está leyendo el paso doce es peor que
   * cualquier descuadre.
   */
  const puesto = useRef(false)

  useEffect(() => {
    if (!activo) return

    const colocar = (suave: boolean) => {
      const nodo = zona.current
      if (!nodo) return

      const quieto = window.matchMedia('(prefers-reduced-motion: reduce)')
      nodo.scrollIntoView({
        behavior: suave && !quieto.matches ? 'smooth' : 'auto',
        block: 'start',
      })
      puesto.current = true
    }

    // Se espera un fotograma: en el primero el contenido todavía se está
    // midiendo y el sitio al que hay que ir aún no es el bueno.
    const marco = requestAnimationFrame(() => colocar(true))

    /**
     * Al girar la tablet se vuelve a colocar.
     *
     * La colocación es una posición de desplazamiento, y al girar cambia
     * todo lo que había debajo: la misma posición ya no señala el mismo
     * sitio, así que la receta aparecía cortada por la mitad o con media
     * cabecera asomando. Se rehace, y sin animación, que aquí no hay
     * nada que enseñar: solo que siga cuadrado.
     */
    const alGirar = () => {
      if (!puesto.current) return
      // Dos fotogramas: el primero lo pide el navegador para rehacer la
      // medida, y hasta el segundo el sitio nuevo no está en su sitio.
      requestAnimationFrame(() => requestAnimationFrame(() => colocar(false)))
    }

    /** Quien se desplaza por su cuenta manda: se le deja donde esté. */
    const alMoverse = () => {
      const nodo = zona.current
      if (!nodo) return
      const arriba = nodo.getBoundingClientRect().top
      if (Math.abs(arriba) > 8) puesto.current = false
    }

    window.addEventListener('resize', alGirar)
    window.addEventListener('scroll', alMoverse, { passive: true })

    return () => {
      cancelAnimationFrame(marco)
      window.removeEventListener('resize', alGirar)
      window.removeEventListener('scroll', alMoverse)
    }
  }, [activo])

  return zona
}
