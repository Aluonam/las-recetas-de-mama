/**
 * Prueba de permisos contra la base de datos de verdad.
 *
 * No simula nada: abre tres sesiones distintas, como tres personas
 * distintas, y comprueba quién puede hacer qué. Es la única forma de
 * saber que las reglas de seguridad hacen lo que dicen, porque viven en
 * PostgreSQL y no en el código de la aplicación.
 *
 *   node scripts/prueba-permisos.mjs
 *
 * Necesita .env.local con las claves, y las sesiones anónimas activadas
 * en Supabase.
 *
 * Deja creado un recetario de prueba. Al final dice cómo borrarlo.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

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

/** Cada persona necesita su cliente: si comparten, comparten sesión. */
function nuevaPersona() {
  return createClient(URL, CLAVE, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

// ---------------------------------------------------------------
//  Contabilidad de la prueba
// ---------------------------------------------------------------
let fallos = 0

function comprobar(descripcion, bien, detalle = '') {
  if (!bien) fallos++
  const marca = bien ? 'OK   ' : 'FALLA'
  console.log(`${marca}  ${descripcion}${detalle ? `  ->  ${detalle}` : ''}`)
}

const SUFIJO = Date.now().toString().slice(-6)
const CODIGO = `ROMAN-${SUFIJO}`

// ---------------------------------------------------------------
async function principal() {
  console.log('\n=== Recetario de la familia Román ===\n')

  // ---------- La creadora ----------
  const creadora = nuevaPersona()
  const { error: falloA } = await creadora.auth.signInAnonymously()
  comprobar('La creadora abre sesión', !falloA, falloA?.message)
  if (falloA) return

  const { data: recetario, error: falloCrear } = await creadora
    .rpc('crear_recetario', {
      p_nombre: 'Las recetas de la familia Román',
      p_codigo: CODIGO,
      p_correo: 'creadora@ejemplo.com',
    })
    .single()

  comprobar('Crea el recetario', !falloCrear, falloCrear?.message)
  if (falloCrear) return
  console.log(`       nombre: ${recetario.nombre}   código: ${recetario.codigo}\n`)

  // ---------- Otro miembro de la familia ----------
  const familiar = nuevaPersona()
  await familiar.auth.signInAnonymously()

  const { error: falloUnirse } = await familiar
    .rpc('unirse_con_codigo', {
      p_codigo: CODIGO.toLowerCase(), // a propósito: no debe distinguir
      p_correo: 'familiar@ejemplo.com',
    })
    .single()

  comprobar('Un familiar entra con el código', !falloUnirse, falloUnirse?.message)

  // ---------- Un desconocido ----------
  const desconocido = nuevaPersona()
  await desconocido.auth.signInAnonymously()

  const { error: falloCodigo } = await desconocido
    .rpc('unirse_con_codigo', { p_codigo: 'ESTO-NO-EXISTE' })
    .single()

  comprobar('Un código inventado no entra', Boolean(falloCodigo))

  // ---------- AÑADIR: el familiar sí puede ----------
  const { data: creadaPorFamiliar, error: falloInsertar } = await familiar
    .from('receta')
    .insert({
      titulo: 'Torrijas de prueba',
      familia_id: recetario.id,
      creada_por: (await familiar.auth.getUser()).data.user.id,
      ocasiones: [],
      ingredientes: [],
      materiales: [],
      pasos: [],
      trucos: [],
      fotos: [],
    })
    .select()
    .single()

  comprobar('El familiar AÑADE una receta', !falloInsertar, falloInsertar?.message)
  if (falloInsertar) return

  // ---------- EDITAR: el familiar sí puede ----------
  const { data: editadas } = await familiar
    .from('receta')
    .update({ descripcion: 'Editada por el familiar' })
    .eq('id', creadaPorFamiliar.id)
    .select()

  comprobar('El familiar EDITA la receta', editadas?.length === 1)

  // ---------- EDITAR lo de otro: también puede ----------
  const { data: recetaDeLaJefa } = await creadora
    .from('receta')
    .insert({
      titulo: 'Croquetas de prueba',
      familia_id: recetario.id,
      creada_por: (await creadora.auth.getUser()).data.user.id,
      ocasiones: [],
      ingredientes: [],
      materiales: [],
      pasos: [],
      trucos: [],
      fotos: [],
    })
    .select()
    .single()

  const { data: ajenaEditada } = await familiar
    .from('receta')
    .update({ descripcion: 'El familiar edita la de la jefa' })
    .eq('id', recetaDeLaJefa.id)
    .select()

  comprobar('El familiar EDITA una receta ajena', ajenaEditada?.length === 1)

  // ---------- BORRAR: el familiar NO puede ----------
  // Ni siquiera la suya propia.
  const { data: borradasPorFamiliar } = await familiar
    .from('receta')
    .delete()
    .eq('id', creadaPorFamiliar.id)
    .select()

  comprobar(
    'El familiar NO puede BORRAR ni su propia receta',
    borradasPorFamiliar?.length === 0,
    `borró ${borradasPorFamiliar?.length ?? '?'}`,
  )

  const { data: borradaAjena } = await familiar
    .from('receta')
    .delete()
    .eq('id', recetaDeLaJefa.id)
    .select()

  comprobar(
    'El familiar NO puede BORRAR una receta ajena',
    borradaAjena?.length === 0,
    `borró ${borradaAjena?.length ?? '?'}`,
  )

  // ---------- BORRAR: la creadora sí puede, y cualquiera ----------
  const { data: borradaPorJefa } = await creadora
    .from('receta')
    .delete()
    .eq('id', creadaPorFamiliar.id)
    .select()

  comprobar(
    'La creadora BORRA la receta de otro',
    borradaPorJefa?.length === 1,
    `borró ${borradaPorJefa?.length ?? '?'}`,
  )

  // ---------- CAMBIAR EL CÓDIGO: solo la creadora ----------
  // Cambiarlo deja fuera a quien todavía no lo tenga, así que no puede
  // hacerlo cualquiera.
  const { error: falloCambioAjeno } = await familiar.rpc('establecer_codigo', {
    p_familia_id: recetario.id,
    p_codigo: `ROBADO-${SUFIJO}`,
  })

  comprobar(
    'El familiar NO puede cambiar el código',
    Boolean(falloCambioAjeno),
    falloCambioAjeno ? '' : 'lo cambió',
  )

  const { data: codigoNuevo, error: falloCambioPropio } = await creadora.rpc(
    'establecer_codigo',
    { p_familia_id: recetario.id, p_codigo: `ROMAN-${SUFIJO}B` },
  )

  comprobar(
    'La creadora SÍ puede cambiar el código',
    !falloCambioPropio && Boolean(codigoNuevo),
    falloCambioPropio?.message,
  )

  // ---------- Aislamiento entre familias ----------
  const { data: loQueVeElDesconocido } = await desconocido
    .from('receta')
    .select('id')
    .eq('familia_id', recetario.id)

  comprobar(
    'Un desconocido no ve NADA del recetario',
    (loQueVeElDesconocido?.length ?? 0) === 0,
    `vio ${loQueVeElDesconocido?.length ?? '?'}`,
  )

  const { data: recetariosAjenos } = await desconocido
    .from('familia')
    .select('id, nombre')

  comprobar(
    'Un desconocido no ve que existan otros recetarios',
    (recetariosAjenos?.length ?? 0) === 0,
    `vio ${recetariosAjenos?.length ?? '?'}`,
  )

  // ---------- Limpieza de lo que se pueda ----------
  await creadora.from('receta').delete().eq('familia_id', recetario.id)

  console.log(
    `\n--- Recetario de prueba creado: «${recetario.nombre}» (${recetario.codigo})\n` +
      '    Las recetas ya están borradas. Para quitar el recetario entero,\n' +
      '    desde el SQL Editor de Supabase:\n\n' +
      `      delete from public.familia where codigo = '${recetario.codigo}';\n`,
  )
}

await principal()

console.log(
  fallos === 0
    ? '\nTODO CORRECTO. Los permisos hacen lo que dicen.\n'
    : `\n${fallos} COMPROBACIONES FALLIDAS.\n`,
)
process.exit(fallos === 0 ? 0 : 1)
