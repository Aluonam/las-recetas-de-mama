/**
 * Recetario de prueba con una receta por letra.
 *
 * Sirve para ver cómo queda el índice del canto del libro cuando hay
 * abecedario entero: con cuatro recetas no se sabe si las lengüetas
 * caben, si se leen o si se comen la página.
 *
 *   node scripts/recetario-abecedario.mjs
 *
 * Crea su propio recetario con su propio código, así que no toca las
 * recetas de casa. Al terminar dice el código para entrar desde la web.
 *
 * Necesita .env.local con las claves, y las sesiones anónimas activadas
 * en Supabase. Para borrarlo después, supabase/limpiar-pruebas.sql se
 * lleva los códigos que empiezan por ABC-.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')

function leerEntorno() {
  const texto = readFileSync(join(raiz, '.env.local'), 'utf8')
  const valores = {}
  for (const linea of texto.split('\n')) {
    const pareja = linea.match(/^\s*(VITE_[A-Z_]+)\s*=\s*(.+?)\s*$/)
    if (pareja) valores[pareja[1]] = pareja[2]
  }
  return valores
}

const entorno = leerEntorno()
const URL = entorno.VITE_SUPABASE_URL
const CLAVE = entorno.VITE_SUPABASE_ANON_KEY

if (!URL || !CLAVE) {
  console.error('Faltan las claves en .env.local')
  process.exit(1)
}

const CODIGO = `ABC-${Date.now().toString().slice(-6)}`

/**
 * Las recetas, una por letra.
 *
 * Platos de verdad, no «Receta A», «Receta B»: los nombres reales tienen
 * largos distintos y eso es justo lo que hay que ver en el índice.
 *
 * Hay tres cosas puestas a mala idea, para que la prueba pruebe algo:
 *
 *  - Cuatro títulos empiezan por artículo. «Las torrijas» tiene que
 *    archivarse en la T, no en la L, y ahí se ve si el índice ordena
 *    como un libro o como un ordenador.
 *  - La A y la T llevan dos recetas. Una letra con varias entradas es lo
 *    normal en un recetario, y la lengüeta debe salir una sola vez.
 *  - La I no lleva elaboración, para ver el hueco del «(vacío)».
 */
const RECETAS = [
  ['Albóndigas en salsa', 'La abuela Carmen', 75, ['Domingos']],
  ['Arroz con leche', 'La abuela Carmen', 45, ['Domingos']],
  ['Bacalao al pil-pil', 'El tío Ramón', 50, ['Semana Santa']],
  ['Croquetas de jamón', 'Mamá', 90, ['Nochebuena', 'Domingos']],
  ['Dulce de membrillo', 'La yaya Pilar', 120, ['Verano']],
  ['La empanada gallega', 'La tía Rosa', 100, ['Días de fiesta']],
  ['Fabada asturiana', 'El tío Ramón', 180, ['De diario']],
  ['Gazpacho andaluz', 'Mamá', 20, ['Verano']],
  ['Huevos rotos con jamón', 'Papá', 25, ['De diario']],
  ['Intxaursalsa', 'La yaya Pilar', 40, ['Nochebuena']],
  ['Judías verdes con jamón', 'Mamá', 35, ['De diario']],
  ['Kokotxas al pil-pil', 'El tío Ramón', 30, ['Días de fiesta']],
  ['Las lentejas de la abuela', 'La abuela Carmen', 90, ['De diario']],
  ['Marmitako', 'El tío Ramón', 60, ['Verano']],
  ['Natillas de la abuela', 'La abuela Carmen', 40, ['Enfermitos']],
  ['Ñoquis de patata', 'La tía Rosa', 70, ['Domingos']],
  ['Olla podrida', 'La yaya Pilar', 200, ['De diario']],
  ['El pisto manchego', 'Mamá', 55, ['Verano', 'De diario']],
  ['Quesada pasiega', 'La tía Rosa', 65, ['Cumpleaños']],
  ['Rabo de toro', 'Papá', 210, ['Días de fiesta']],
  ['Salmorejo cordobés', 'Mamá', 20, ['Verano']],
  ['Las torrijas de Semana Santa', 'La abuela Carmen', 50, ['Semana Santa']],
  ['Tarta de queso de la yaya', 'La yaya Pilar', 60, ['Cumpleaños']],
  ['Urta a la roteña', 'El tío Ramón', 55, ['Verano']],
  ['Vieiras al horno', 'La tía Rosa', 35, ['Nochebuena']],
  ['Wafles de la merienda', 'Papá', 25, ['Cumpleaños']],
  ['Xató', 'La tía Rosa', 45, ['Domingos']],
  ['Yemas de Santa Teresa', 'La yaya Pilar', 40, ['Semana Santa']],
  ['Zarzuela de pescado', 'El tío Ramón', 80, ['Nochebuena']],
]

/** Sin elaboración, para ver el hueco del «(vacío)» en la página derecha. */
const SIN_ELABORACION = 'Intxaursalsa'

const INGREDIENTES = [
  ['Aceite de oliva virgen extra', 'un chorro generoso'],
  ['Cebolla', 'una hermosa'],
  ['Ajo', 'dos dientes'],
  ['Sal', 'la que pida'],
  ['Pimentón de la Vera', 'una cucharadita'],
  ['Perejil fresco', 'un manojo'],
]

const PASOS = [
  'Se pone la cazuela a fuego suave y se deja que coja calor sin prisa.',
  'Se pocha la cebolla con el ajo hasta que esté transparente, sin que llegue a dorarse.',
  'Se añade el resto y se remueve con cuchara de madera, siempre en el mismo sentido.',
  'Se deja reposar tapado antes de servir. Al día siguiente está mejor.',
]

const TRUCOS = [
  'Si se corta, un chorrito de agua fría y a batir. Nunca falla.',
  'El secreto está en no tener prisa con la cebolla.',
  'Se congela bien en raciones, pero pierde algo de gracia.',
]

/** Un id por elemento, como los que pone el formulario. */
const conIds = (cosas) => cosas.map((cosa) => ({ id: randomUUID(), ...cosa }))

// ---------------------------------------------------------------
//  Las fotos
// ---------------------------------------------------------------

/**
 * Un plato visto desde arriba, dibujado.
 *
 * No son fotos de verdad, pero para lo que hacen falta —ver cómo queda
 * la portada en la página izquierda, si el arco la recorta bien, si el
 * marco doble aprieta— sirven igual, y tienen la ventaja de que se
 * generan aquí sin descargar nada de fuera.
 *
 * Cada receta sale de un color distinto para que las veintinueve hojas
 * no parezcan la misma. Los manteles son los de la web: verde damasco,
 * rosa de La Cartuja y crema.
 */
const MANTELES = ['#dde5ce', '#f2dfe3', '#eee9dd', '#e3e8d8']

/**
 * Números repetibles a partir de la posición.
 *
 * Con `Math.random` cada ejecución daría platos distintos y no habría
 * forma de comparar dos pruebas. Así la receta número 7 sale siempre
 * igual.
 */
function dados(semilla) {
  let estado = (semilla + 1) * 9301
  return () => {
    estado = (estado * 9301 + 49297) % 233280
    return estado / 233280
  }
}

function svgDePlato(posicion) {
  const sacar = dados(posicion)
  const tono = (28 + posicion * 43) % 360
  const mantel = MANTELES[posicion % MANTELES.length]

  // La comida: unos cuantos bultos dentro del plato, de tamaños y tonos
  // parecidos pero no iguales, como un guiso de verdad.
  const bultos = []
  const cuantos = 5 + Math.floor(sacar() * 4)

  for (let n = 0; n < cuantos; n++) {
    const angulo = sacar() * Math.PI * 2
    const lejos = sacar() * 52
    const x = 240 + Math.cos(angulo) * lejos
    const y = 180 + Math.sin(angulo) * lejos * 0.86
    const ancho = 26 + sacar() * 24
    const alto = ancho * (0.66 + sacar() * 0.3)
    const claro = 38 + sacar() * 22
    const giro = Math.floor(sacar() * 180)

    bultos.push(
      `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${ancho.toFixed(0)}" ry="${alto.toFixed(0)}"` +
        ` fill="hsl(${tono} 58% ${claro.toFixed(0)}%)" transform="rotate(${giro} ${x.toFixed(0)} ${y.toFixed(0)})"/>`,
    )
  }

  // Cuatro toques de verde por encima: perejil, y de paso rompen el
  // color plano.
  const hierbas = []
  for (let n = 0; n < 4; n++) {
    const x = 205 + sacar() * 70
    const y = 145 + sacar() * 70
    hierbas.push(
      `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="7" ry="4"` +
        ` fill="#5d7a55" opacity=".62" transform="rotate(${Math.floor(sacar() * 180)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`,
    )
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
<rect width="480" height="360" fill="${mantel}"/>
<g stroke="#ffffff" stroke-width="14" opacity=".28">
  <path d="M60 0v360M180 0v360M300 0v360M420 0v360"/>
</g>
<ellipse cx="244" cy="192" rx="146" ry="132" fill="#000" opacity=".13"/>
<circle cx="240" cy="180" r="146" fill="#fbf7ef"/>
<circle cx="240" cy="180" r="146" fill="none" stroke="#e3dccd" stroke-width="3"/>
<circle cx="240" cy="180" r="112" fill="none" stroke="#e8dfd0" stroke-width="2"/>
<circle cx="240" cy="180" r="104" fill="hsl(${tono} 34% 88%)" opacity=".55"/>
${bultos.join('\n')}
${hierbas.join('\n')}
</svg>`
}

function receta([titulo, autor, minutos, ocasiones], posicion) {
  // Cantidades distintas por receta para que las páginas no salgan
  // calcadas: un libro con veintinueve hojas idénticas no prueba nada.
  const cuantos = 3 + (posicion % 4)

  return {
    titulo,
    descripcion: `Como la hacía ${autor} en casa, de toda la vida.`,
    autor_nombre: autor,
    autor_relacion: null,
    aprendida_de: null,
    anio_origen: null,
    por_que_especial:
      posicion % 3 === 0
        ? `Esta es de las que huelen a domingo. En cuanto ${autor} la ponía en la mesa, ya no hablaba nadie.`
        : null,
    ocasiones,
    raciones: `Para ${4 + (posicion % 3)}`,
    tiempo_minutos: minutos,
    ingredientes: conIds(
      INGREDIENTES.slice(0, cuantos).map(([nombre, cantidadCasera]) => ({
        nombre,
        cantidadCasera,
      })),
    ),
    materiales:
      posicion % 4 === 0
        ? conIds([{ nombre: 'La cazuela de barro, la de siempre' }])
        : [],
    pasos:
      titulo === SIN_ELABORACION
        ? []
        : conIds(PASOS.slice(0, 2 + (posicion % 3)).map((texto) => ({ texto }))),
    trucos:
      posicion % 2 === 0
        ? conIds([{ texto: TRUCOS[posicion % TRUCOS.length], deQuien: autor }])
        : [],
    fotos: [],
    foto_portada_url: null,
    audio_url: null,
  }
}

async function principal() {
  console.log('\n=== Recetario del abecedario ===\n')

  const cliente = createClient(URL, CLAVE, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: sesion, error: falloSesion } =
    await cliente.auth.signInAnonymously()

  if (falloSesion) {
    console.error('No se pudo abrir sesión:', falloSesion.message)
    process.exit(1)
  }

  const { data: recetario, error: falloCrear } = await cliente
    .rpc('crear_recetario', {
      p_nombre: 'Prueba del abecedario',
      p_codigo: CODIGO,
      p_correo: 'pruebas@ejemplo.com',
    })
    .single()

  if (falloCrear) {
    console.error('No se pudo crear el recetario:', falloCrear.message)
    process.exit(1)
  }

  /**
   * Las portadas se suben antes, porque la receta guarda la ruta.
   *
   * Una de cada cuatro se queda sin foto a propósito: hay que ver
   * también cómo respira la página cuando en su sitio solo va la
   * guirnalda.
   */
  const filas = []

  for (const [posicion, datos] of RECETAS.entries()) {
    const fila = {
      ...receta(datos, posicion),
      creada_por: sesion.user.id,
      familia_id: recetario.id,
    }

    if (posicion % 4 !== 3) {
      const ruta = `${recetario.id}/fotos/${randomUUID()}.svg`
      const { error: falloSubir } = await cliente.storage
        .from('recetas')
        .upload(ruta, Buffer.from(svgDePlato(posicion), 'utf8'), {
          contentType: 'image/svg+xml',
          cacheControl: '31536000',
        })

      if (falloSubir) {
        console.error(`No se pudo subir la foto de ${datos[0]}:`, falloSubir.message)
        process.exit(1)
      }

      fila.foto_portada_url = ruta
    }

    filas.push(fila)
  }

  const { error: falloInsertar } = await cliente.from('receta').insert(filas)

  if (falloInsertar) {
    console.error('No se pudieron guardar las recetas:', falloInsertar.message)
    process.exit(1)
  }

  // Las mismas reglas que el índice del libro: fuera el artículo, y la
  // letra es la de la primera palabra que cuenta.
  const ARTICULOS = ['el ', 'la ', 'los ', 'las ', 'un ', 'una ']
  const letraDe = (titulo) => {
    const limpio = titulo.trim()
    const articulo = ARTICULOS.find((a) => limpio.toLowerCase().startsWith(a))
    const util = articulo ? limpio.slice(articulo.length) : limpio
    const primera = util.charAt(0).toUpperCase()
    return primera === 'Ñ' ? 'Ñ' : primera.normalize('NFD').charAt(0)
  }

  const letras = [...new Set(RECETAS.map(([t]) => letraDe(t)))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  )

  console.log(`Recetario:  ${recetario.nombre}`)
  console.log(`Código:     ${recetario.codigo}`)
  console.log(`Recetas:    ${filas.length}`)
  console.log(
    `Con foto:   ${filas.filter((f) => f.foto_portada_url).length}` +
      `  (el resto, a propósito sin ella)`,
  )
  console.log(`Letras:     ${letras.join(' ')}  (${letras.length})\n`)
  console.log('Entra en la web, «Tengo un código» y pega el código de arriba.')
  console.log('Luego pon la vista en Libro y mira el canto izquierdo.\n')
  console.log('Para borrarlo después: supabase/limpiar-pruebas.sql\n')
}

principal().catch((fallo) => {
  console.error(fallo)
  process.exit(1)
})
