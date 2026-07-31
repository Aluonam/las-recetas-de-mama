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

  const filas = RECETAS.map((datos, posicion) => ({
    ...receta(datos, posicion),
    creada_por: sesion.user.id,
    familia_id: recetario.id,
  }))

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
  console.log(`Letras:     ${letras.join(' ')}  (${letras.length})\n`)
  console.log('Entra en la web, «Tengo un código» y pega el código de arriba.')
  console.log('Luego pon la vista en Libro y mira el canto izquierdo.\n')
  console.log('Para borrarlo después: supabase/limpiar-pruebas.sql\n')
}

principal().catch((fallo) => {
  console.error(fallo)
  process.exit(1)
})
