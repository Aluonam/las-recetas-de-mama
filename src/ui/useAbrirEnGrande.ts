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

  useEffect(() => {
    if (!activo) return

    // Se espera un fotograma: en el primero el contenido todavía se está
    // midiendo y el sitio al que hay que ir aún no es el bueno.
    const marco = requestAnimationFrame(() => {
      const quieto = window.matchMedia('(prefers-reduced-motion: reduce)')
      zona.current?.scrollIntoView({
        behavior: quieto.matches ? 'auto' : 'smooth',
        block: 'start',
      })
    })

    return () => cancelAnimationFrame(marco)
  }, [activo])

  return zona
}
