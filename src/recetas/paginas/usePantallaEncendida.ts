import { useEffect } from 'react'

/**
 * Mantiene la pantalla encendida mientras se cocina.
 *
 * Sin esto se apaga a medio sofrito y hay que desbloquear el móvil con las
 * manos pringadas. Si el navegador no soporta Wake Lock, no pasa nada: se
 * ignora en silencio.
 */
export function usePantallaEncendida() {
  useEffect(() => {
    let bloqueo: WakeLockSentinel | null = null
    let desmontado = false

    const pedir = async () => {
      try {
        bloqueo = (await navigator.wakeLock?.request('screen')) ?? null
        // Si el componente se desmontó mientras esperábamos, soltamos ya.
        if (desmontado) bloqueo?.release()
      } catch {
        // No soportado o denegado. No es crítico.
      }
    }

    // El bloqueo se pierde al cambiar de pestaña: hay que volver a pedirlo.
    const alVolver = () => {
      if (document.visibilityState === 'visible') pedir()
    }

    pedir()
    document.addEventListener('visibilitychange', alVolver)

    return () => {
      desmontado = true
      document.removeEventListener('visibilitychange', alVolver)
      bloqueo?.release().catch(() => {})
    }
  }, [])
}
