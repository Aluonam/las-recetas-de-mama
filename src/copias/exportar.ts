import JSZip from 'jszip'
import { listarRecetas, obtenerReceta } from '../recetas/api'
import { listarVariantes } from '../variantes/api'
import { urlDeArchivo } from '../recetas/almacenamiento'
import type { Receta } from '../recetas/tipos'
import type { Variante } from '../variantes/tipos'

/**
 * Copia de seguridad completa del recetario, en un solo archivo.
 *
 * Esto no es un extra: es la razón de ser del proyecto. Una receta se
 * puede volver a escribir; la voz de tu abuela contándola, no. Y el plan
 * gratuito de Supabase no hace copias.
 *
 * El resultado es un ZIP con los datos en JSON legible y los archivos
 * dentro, en carpetas. Se abre con cualquier cosa y no necesita esta app
 * para entenderse dentro de veinte años.
 */

export interface Progreso {
  hecho: number
  total: number
  paso: string
}

interface Copia {
  generadaEn: string
  version: 1
  recetas: Receta[]
  variantes: Variante[]
}

/** Nombre de archivo seguro en cualquier sistema. */
function comoNombre(texto: string): string {
  return texto
    .normalize('NFD')
    .split('')
    .filter((c) => c.charCodeAt(0) < 0x0300 || c.charCodeAt(0) > 0x036f)
    .join('')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .toLowerCase()
}

/**
 * Todo lo que una receta guarda como archivo.
 *
 * Si aquí se olvida uno, la copia sale con el JSON apuntando a un
 * archivo que no está: parece completa y no lo está, que es la peor
 * manera de fallar que tiene una copia de seguridad.
 */
function archivosDe(receta: Receta): string[] {
  return [
    receta.fotoPortadaUrl,
    receta.audioUrl,
    ...receta.audios.map((audio) => audio.url),
    ...receta.pasos.map((paso) => paso.fotoUrl),
    ...receta.pasos.map((paso) => paso.audioUrl),
    ...receta.fotos.map((foto) => foto.url),
  ].filter((valor): valor is string => Boolean(valor))
}

export async function generarCopia(
  alAvanzar?: (progreso: Progreso) => void,
): Promise<Blob> {
  const resumenes = await listarRecetas()
  // Cada receta cuenta dos veces: traerla y bajar sus archivos.
  const total = resumenes.length * 2 + 1
  let hecho = 0

  const avanzar = (paso: string) => {
    hecho++
    alAvanzar?.({ hecho, total, paso })
  }

  const recetas: Receta[] = []
  const variantes: Variante[] = []

  for (const resumen of resumenes) {
    recetas.push(await obtenerReceta(resumen.id))
    variantes.push(...(await listarVariantes(resumen.id)))
    avanzar(`Recogiendo «${resumen.titulo}»`)
  }

  const zip = new JSZip()

  const copia: Copia = {
    generadaEn: new Date().toISOString(),
    version: 1,
    recetas,
    variantes,
  }
  zip.file('recetas.json', JSON.stringify(copia, null, 2))
  zip.file('LEEME.txt', LEEME)

  for (const receta of recetas) {
    const carpeta = zip.folder(comoNombre(receta.titulo) || receta.id)

    for (const archivo of archivosDe(receta)) {
      try {
        const url = await urlDeArchivo(archivo)
        const respuesta = await fetch(url)
        if (!respuesta.ok) continue

        // El nombre real si es una ruta del bucket; si no, uno inventado.
        const nombre = archivo.includes('/')
          ? archivo.split('/').pop()!
          : `archivo-${carpeta?.files ? Object.keys(carpeta.files).length : 0}`

        carpeta?.file(nombre, await respuesta.blob())
      } catch {
        // Un archivo que no se puede bajar no debe tumbar la copia
        // entera: se anota en el JSON y las demás recetas se salvan.
      }
    }

    avanzar(`Guardando las fotos de «${receta.titulo}»`)
  }

  avanzar('Comprimiendo')
  return zip.generateAsync({ type: 'blob' })
}

/** Lanza la descarga en el navegador. */
export function descargar(copia: Blob, fecha: Date) {
  const dia = fecha.toISOString().slice(0, 10)
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(copia)
  enlace.download = `recetas-de-mama-${dia}.zip`
  enlace.click()
  URL.revokeObjectURL(enlace.href)
}

const LEEME = `LAS RECETAS DE MAMÁ — copia de seguridad
========================================

Este archivo contiene el recetario completo.

  recetas.json   Todas las recetas y sus variantes, en texto legible.
  (carpetas)     Una por receta, con sus fotos y sus audios.

El JSON se puede abrir con cualquier editor de texto. Las fotos y los
audios son archivos normales: se ven y se escuchan sin necesitar la
aplicación.

Guarda este archivo en más de un sitio. Un disco que se estropea y una
nube que cierra la cuenta pasan más de lo que parece, y estas recetas no
están en ningún otro lado.
`
