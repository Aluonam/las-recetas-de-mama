import { supabase } from '../nucleo/supabase'
import { HAY_SUPABASE } from '../nucleo/entorno'
import { exigirFamilia } from '../familias/actual'

/**
 * Subida de fotos y audios al bucket `recetas`.
 *
 * Aparte de api.ts a propósito: guardar archivos y guardar filas son dos
 * responsabilidades distintas.
 */

const MB = 1024 * 1024

interface Clase {
  /** Prefijo de tipo MIME que se acepta. */
  familia: 'image' | 'audio'
  carpeta: string
  limite: number
  /** Cómo se llama esto al hablarle a la persona. */
  nombre: string
}

const FOTO: Clase = { familia: 'image', carpeta: 'fotos', limite: 10 * MB, nombre: 'foto' }
const AUDIO: Clase = { familia: 'audio', carpeta: 'audios', limite: 25 * MB, nombre: 'audio' }

/**
 * En modo demostración no hay servidor: el archivo se guarda como data URL
 * dentro de la propia receta, en localStorage. Cabe mucho menos, así que el
 * límite es otro.
 */
const LIMITE_DEMOSTRACION = 1.5 * MB

export async function subirFoto(archivo: File): Promise<string> {
  return subir(archivo, FOTO, archivo.name)
}

/**
 * Acepta tanto un archivo elegido por la persona como el Blob que devuelve
 * la grabadora, que no tiene nombre.
 */
export async function subirAudio(audio: Blob, nombre?: string): Promise<string> {
  return subir(audio, AUDIO, nombre)
}

async function subir(archivo: Blob, clase: Clase, nombre?: string): Promise<string> {
  validar(archivo, clase)

  if (!HAY_SUPABASE) return aDataUrl(archivo, clase)

  // La carpeta de primer nivel es el recetario. Las reglas de la base la
  // miran para decidir si puedes ver o subir un archivo: sin ella, adivinar
  // una ruta bastaría para colarse en el álbum de otra casa.
  const ruta =
    `${exigirFamilia()}/${clase.carpeta}/` +
    `${crypto.randomUUID()}.${extensionDe(archivo, nombre)}`

  const { error } = await supabase.storage
    .from('recetas')
    .upload(ruta, archivo, {
      cacheControl: '31536000',
      upsert: false,
      contentType: archivo.type || undefined,
    })

  if (error) throw error

  // Se guarda la ruta, no una dirección.
  //
  // El bucket es privado: no existe una URL permanente que valga para
  // siempre. Cada vez que hay que enseñar la foto se pide un enlace
  // firmado que caduca. Guardar direcciones aquí sería guardar enlaces
  // muertos.
  return ruta
}

/**
 * Convierte lo guardado en una receta en algo que un `src` pueda usar.
 *
 * Convive con tres formatos, y los tres tienen que seguir funcionando:
 * - Rutas del bucket privado, que es lo que se guarda ahora.
 * - Data URLs del modo demostración.
 * - Direcciones completas de cuando el bucket era público.
 */
export async function urlDeArchivo(guardado: string): Promise<string> {
  if (esDirecta(guardado)) return guardado

  const enCache = firmadas.get(guardado)
  if (enCache && enCache.caduca > Date.now()) return enCache.url

  const { data, error } = await supabase.storage
    .from('recetas')
    .createSignedUrl(guardado, DURACION_FIRMA)

  if (error) throw error

  firmadas.set(guardado, {
    url: data.signedUrl,
    // Se renueva antes de tiempo: un enlace que caduca a mitad de un
    // audio deja a la abuela cortada a media frase.
    caduca: Date.now() + (DURACION_FIRMA - 300) * 1000,
  })

  return data.signedUrl
}

/** Ya es utilizable tal cual: no hay nada que firmar. */
export const esDirecta = (guardado: string) =>
  guardado.startsWith('http') || guardado.startsWith('data:') ||
  guardado.startsWith('blob:')

const DURACION_FIRMA = 3600
const firmadas = new Map<string, { url: string; caduca: number }>()

function validar(archivo: Blob, clase: Clase): void {
  // Se compara solo la familia ("image", "audio"): los subtipos y codecs
  // varían demasiado entre navegadores y móviles para listarlos.
  const tipo = archivo.type.split(';')[0].trim()

  if (tipo && !tipo.startsWith(`${clase.familia}/`)) {
    throw new Error(`Ese archivo no es un ${clase.nombre}.`)
  }

  const limite = HAY_SUPABASE ? clase.limite : LIMITE_DEMOSTRACION
  if (archivo.size > limite) {
    const mb = Math.round(limite / MB)
    throw new Error(
      HAY_SUPABASE
        ? `Ese ${clase.nombre} pesa más de ${mb} MB. Prueba con uno más ligero.`
        : `En modo demostración el ${clase.nombre} no puede pasar de ${mb} MB, ` +
          'porque se guarda dentro del navegador. Con Supabase configurado el ' +
          'límite es mucho mayor.',
    )
  }
}

function extensionDe(archivo: Blob, nombre?: string): string {
  if (nombre?.includes('.')) return nombre.split('.').pop()!.toLowerCase()

  const subtipo = archivo.type.split(';')[0].split('/')[1] ?? ''
  if (subtipo === 'mpeg') return 'mp3'
  if (subtipo === 'x-m4a') return 'm4a'
  if (subtipo === 'jpeg') return 'jpg'
  return subtipo || 'bin'
}

/**
 * Guarda el archivo dentro de la propia receta, en base64.
 *
 * Es lo que permite que en modo demostración una foto o un audio sigan ahí
 * al recargar la página. Con un objectURL se perderían, y entonces la
 * funcionalidad parece rota cuando en realidad no lo está.
 */
function aDataUrl(archivo: Blob, clase: Clase): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const lector = new FileReader()
    lector.onload = () => resolver(lector.result as string)
    lector.onerror = () =>
      rechazar(new Error(`No se pudo leer el ${clase.nombre}.`))
    lector.readAsDataURL(archivo)
  })
}
