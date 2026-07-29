import { useEffect, useState } from 'react'

/**
 * Instalar la app en la pantalla de inicio.
 *
 * Android y Chrome avisan con un evento y dejan lanzar el diálogo. iOS no:
 * Apple obliga a hacerlo a mano desde el menú de Safari, así que ahí lo
 * único que se puede hacer es explicar los tres pasos.
 */

interface EventoInstalacion extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function yaInstalada(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  // Safari en iOS usa su propia marca, anterior al estándar.
  return (navigator as { standalone?: boolean }).standalone === true
}

function esIOS(): boolean {
  const ua = navigator.userAgent
  if (/iphone|ipad|ipod/i.test(ua)) return true
  // El iPad moderno se hace pasar por Mac; se delata por el táctil.
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

export function useInstalacion() {
  const [evento, setEvento] = useState<EventoInstalacion | null>(null)
  const [instalada, setInstalada] = useState(yaInstalada)

  useEffect(() => {
    const alPoderInstalar = (e: Event) => {
      // Sin esto el navegador enseña su propia barra, que pasa
      // desapercibida. Mejor un botón nuestro, grande y en su sitio.
      e.preventDefault()
      setEvento(e as EventoInstalacion)
    }

    const alInstalar = () => {
      setInstalada(true)
      setEvento(null)
    }

    window.addEventListener('beforeinstallprompt', alPoderInstalar)
    window.addEventListener('appinstalled', alInstalar)

    return () => {
      window.removeEventListener('beforeinstallprompt', alPoderInstalar)
      window.removeEventListener('appinstalled', alInstalar)
    }
  }, [])

  const instalar = async () => {
    if (!evento) return
    await evento.prompt()
    await evento.userChoice
    // El evento solo sirve una vez.
    setEvento(null)
  }

  return {
    instalada,
    /** Se puede lanzar el diálogo del sistema. */
    sePuedeInstalar: evento !== null,
    /** Hay que explicarlo a mano porque estamos en iOS. */
    hayQueExplicar: !instalada && evento === null && esIOS(),
    instalar,
  }
}
