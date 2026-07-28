import type { Receta } from '../recetas/tipos'
import type { Variante } from '../variantes/tipos'

/**
 * Recetas de ejemplo del modo demostración.
 *
 * No son relleno: están escritas para enseñar de un vistazo lo que hace
 * distinto a este recetario — la procedencia, las medidas de la abuela, los
 * trucos con nombre y las variantes de cada casa.
 */

const AUTOR_DEMO = '00000000-0000-4000-8000-000000000001'
const FECHA_DEMO = '2024-01-01T00:00:00.000Z'

const CROQUETAS = 'a1000000-0000-4000-8000-000000000001'
const ARROZ_CON_LECHE = 'a1000000-0000-4000-8000-000000000002'
const LENTEJAS = 'a1000000-0000-4000-8000-000000000003'

export const RECETAS_DE_EJEMPLO: Receta[] = [
  {
    id: CROQUETAS,
    titulo: 'Croquetas de la abuela Carmen',
    descripcion: 'Las de siempre. Las que había que hacer el día antes.',
    procedencia: {
      autorNombre: 'La abuela Carmen',
      autorRelacion: 'Abuela',
      aprendidaDe: 'De su madre, Josefa, en el pueblo. Nunca las escribió.',
      anioOrigen: 1958,
    },
    porQueEspecial:
      'Es lo primero que olía la casa cuando llegábamos en Navidad.\n\n' +
      'La abuela empezaba el día antes y no dejaba entrar a nadie en la ' +
      'cocina hasta que la masa estaba fría. Decía que las prisas se notan ' +
      'en la croqueta.',
    ocasiones: ['Nochebuena', 'Navidad', 'Domingos'],
    raciones: 'Salen unas 40, o 30 si está el tío',
    tiempoMinutos: 90,
    ingredientes: [
      {
        id: 'i-1',
        nombre: 'Jamón serrano',
        cantidadCasera: 'Un buen puñado, picado fino',
        cantidad: 150,
        unidad: 'g',
        nota: 'Del taco, nunca en lonchas',
        grupo: 'Para la masa',
      },
      {
        id: 'i-2',
        nombre: 'Harina',
        cantidadCasera: 'La que admita',
        nota: 'Aquí no se pesa: se va echando hasta que la masa se despega',
        grupo: 'Para la masa',
      },
      {
        id: 'i-3',
        nombre: 'Leche entera',
        cantidadCasera: 'Un litro largo, templada',
        cantidad: 1,
        unidad: 'l',
        nota: 'Fría no: se hacen grumos',
        grupo: 'Para la masa',
      },
      {
        id: 'i-4',
        nombre: 'Mantequilla',
        cantidad: 80,
        unidad: 'g',
        grupo: 'Para la masa',
      },
      {
        id: 'i-5',
        nombre: 'Nuez moscada',
        cantidadCasera: 'Una pizca, y no te pases',
        grupo: 'Para la masa',
      },
      { id: 'i-6', nombre: 'Huevos', cantidad: 2, unidad: 'unidad', grupo: 'Para rebozar' },
      {
        id: 'i-7',
        nombre: 'Pan rallado',
        cantidadCasera: 'El que pida',
        grupo: 'Para rebozar',
      },
    ],
    materiales: [
      { id: 'm-1', nombre: 'Cazuela de barro', nota: 'La grande, la de arriba del todo' },
      { id: 'm-2', nombre: 'Cuchara de palo', nota: 'De metal no: raya la cazuela' },
      { id: 'm-3', nombre: 'Fuente honda', nota: 'Para que la masa enfríe extendida' },
    ],
    pasos: [
      {
        id: 'p-1',
        texto:
          'Derrite la mantequilla a fuego suave y sofríe el jamón un par de minutos.',
      },
      {
        id: 'p-2',
        texto:
          'Echa la harina de golpe y remueve sin parar hasta que coja color de avellana. Si sabe a harina cruda, aún le falta.',
      },
      {
        id: 'p-3',
        texto:
          'Añade la leche templada poco a poco, sin dejar de remover. Cuando la masa se despegue sola de la cazuela, está.',
      },
      { id: 'p-4', texto: 'Ralla la nuez moscada, sal al gusto y remueve un minuto más.' },
      {
        id: 'p-5',
        texto:
          'Extiende la masa en la fuente y déjala enfriar toda la noche. Sin atajos.',
      },
      { id: 'p-6', texto: 'Al día siguiente, forma las croquetas, pasa por huevo y pan rallado y fríe en aceite bien caliente.' },
    ],
    trucos: [
      {
        id: 't-1',
        texto:
          'No batas la masa: remuévela con cuchara de palo y siempre en el mismo sentido, o se queda dura.',
        deQuien: 'La abuela Carmen',
      },
      {
        id: 't-2',
        texto:
          'Si la masa te queda blanda, no eches más harina al final. Se arregla dejándola enfriar más tiempo.',
        deQuien: 'La abuela Carmen',
      },
      {
        id: 't-3',
        texto: 'El aceite tiene que humear un poco antes de echarlas, si no chupan grasa.',
      },
    ],
    fotoPortadaUrl: null,
    fotos: [],
    audioUrl: null,
    creadaPor: AUTOR_DEMO,
    creadaEn: FECHA_DEMO,
    actualizadaEn: FECHA_DEMO,
  },

  {
    id: ARROZ_CON_LECHE,
    titulo: 'Arroz con leche',
    descripcion: 'El de la fuente grande, con la canela quemada por encima.',
    procedencia: {
      autorNombre: 'La tía Pili',
      autorRelacion: 'Tía abuela',
      aprendidaDe: 'Lo traía de Asturias, de casa de su marido.',
      anioOrigen: 1972,
    },
    porQueEspecial:
      'Es el postre de todos los cumpleaños de la familia, aunque a nadie ' +
      'se le ocurrió nunca ponerle una vela.\n\n' +
      'La tía Pili lo hacía en una fuente de barro que ya se rompió, y ' +
      'todavía discutimos si sabía distinto por eso.',
    ocasiones: ['Cumpleaños', 'Domingos', 'Días de fiesta'],
    raciones: 'Una fuente grande, para toda la mesa',
    tiempoMinutos: 60,
    ingredientes: [
      {
        id: 'i-1',
        nombre: 'Arroz redondo',
        cantidadCasera: 'Un vaso de los del vino',
        cantidad: 150,
        unidad: 'g',
      },
      {
        id: 'i-2',
        nombre: 'Leche entera',
        cantidadCasera: 'Litro y medio, y ten más a mano',
        cantidad: 1.5,
        unidad: 'l',
      },
      { id: 'i-3', nombre: 'Azúcar', cantidadCasera: 'Al gusto, tirando a poco' },
      { id: 'i-4', nombre: 'Canela en rama', cantidad: 1, unidad: 'rama' },
      { id: 'i-5', nombre: 'Piel de limón', cantidadCasera: 'Una tira, sin lo blanco' },
      { id: 'i-6', nombre: 'Canela molida', cantidadCasera: 'Para espolvorear al final' },
    ],
    materiales: [
      { id: 'm-1', nombre: 'Cazuela de fondo grueso' },
      { id: 'm-2', nombre: 'Fuente de barro', nota: 'O la de cristal, pero no es lo mismo' },
    ],
    pasos: [
      { id: 'p-1', texto: 'Calienta la leche con la canela en rama y la piel de limón, sin que llegue a hervir.' },
      { id: 'p-2', texto: 'Echa el arroz y baja el fuego al mínimo.' },
      {
        id: 'p-3',
        texto:
          'Remueve cada poco durante unos 45 minutos. Si se queda seco, añade más leche caliente.',
      },
      { id: 'p-4', texto: 'Cuando el arroz esté tierno, añade el azúcar y remueve cinco minutos más.' },
      { id: 'p-5', texto: 'Pasa a la fuente y deja enfriar. Espolvorea canela justo antes de servir.' },
    ],
    trucos: [
      {
        id: 't-1',
        texto:
          'El azúcar siempre al final. Si lo echas antes, el arroz no se ablanda.',
        deQuien: 'La tía Pili',
      },
      {
        id: 't-2',
        texto: 'Tiene que parecer demasiado líquido al apagarlo: al enfriar espesa mucho.',
        deQuien: 'La tía Pili',
      },
    ],
    fotoPortadaUrl: null,
    fotos: [],
    audioUrl: null,
    creadaPor: AUTOR_DEMO,
    creadaEn: FECHA_DEMO,
    actualizadaEn: FECHA_DEMO,
  },

  {
    id: LENTEJAS,
    titulo: 'Lentejas de mamá',
    descripcion: 'Las de los martes de toda la vida.',
    procedencia: {
      autorNombre: 'Mamá',
      autorRelacion: 'Madre',
      aprendidaDe: 'De la abuela Carmen, pero las cambió a su manera.',
      anioOrigen: 1990,
    },
    porQueEspecial:
      'No tienen nada de especial y por eso están aquí: son el sabor de ' +
      'volver a casa un martes cualquiera.',
    ocasiones: ['Del diario', 'Cuando alguien está malo'],
    raciones: 'Para 4, y sobra para el día siguiente',
    tiempoMinutos: 45,
    ingredientes: [
      { id: 'i-1', nombre: 'Lentejas pardinas', cantidadCasera: 'Dos vasos', cantidad: 400, unidad: 'g' },
      { id: 'i-2', nombre: 'Cebolla', cantidad: 1, unidad: 'unidad' },
      { id: 'i-3', nombre: 'Zanahoria', cantidad: 2, unidad: 'unidad' },
      { id: 'i-4', nombre: 'Ajo', cantidadCasera: 'Dos dientes, aplastados' },
      { id: 'i-5', nombre: 'Pimentón dulce', cantidadCasera: 'Una cucharadita colmada' },
      { id: 'i-6', nombre: 'Chorizo', cantidadCasera: 'Un trozo, si es día de fiesta' },
      { id: 'i-7', nombre: 'Hoja de laurel', cantidad: 1, unidad: 'hoja' },
    ],
    materiales: [{ id: 'm-1', nombre: 'Olla normal', nota: 'A fuego lento, sin prisa' }],
    pasos: [
      { id: 'p-1', texto: 'Sofríe la cebolla y la zanahoria picadas hasta que la cebolla esté transparente.' },
      { id: 'p-2', texto: 'Añade el ajo y, cuando huela, retira del fuego y echa el pimentón.' },
      { id: 'p-3', texto: 'Devuelve al fuego, añade las lentejas, el laurel y agua hasta cubrir dos dedos por encima.' },
      { id: 'p-4', texto: 'Cuece a fuego lento unos 35 minutos. Sal al final.' },
    ],
    trucos: [
      {
        id: 't-1',
        texto:
          'El pimentón, siempre fuera del fuego. Si se quema, amarga el guiso entero y ya no hay arreglo.',
        deQuien: 'Mamá',
      },
      { id: 't-2', texto: 'La sal al final: si la echas antes, las lentejas se quedan duras.' },
    ],
    fotoPortadaUrl: null,
    fotos: [],
    audioUrl: null,
    creadaPor: AUTOR_DEMO,
    creadaEn: FECHA_DEMO,
    actualizadaEn: FECHA_DEMO,
  },
]

export const VARIANTES_DE_EJEMPLO: Variante[] = [
  {
    id: 'v-1',
    recetaId: CROQUETAS,
    autorNombre: 'Mamá',
    titulo: 'La versión de mamá',
    texto:
      'Le pone la mitad de nuez moscada y un poco de cebolla muy picada en ' +
      'el sofrito. Dice que la abuela lo habría considerado una herejía.',
    creadaEn: FECHA_DEMO,
  },
  {
    id: 'v-2',
    recetaId: CROQUETAS,
    autorNombre: 'La tía Marisa',
    titulo: 'Las de la tía Marisa',
    texto:
      'Sustituye la mitad del jamón por pollo del cocido del día anterior. ' +
      'Salen más suaves y a los niños les gustan más.',
    creadaEn: FECHA_DEMO,
  },
  {
    id: 'v-3',
    recetaId: ARROZ_CON_LECHE,
    autorNombre: 'Papá',
    titulo: 'Con el azúcar quemado',
    texto:
      'Espolvorea azúcar por encima y lo quema con la pala al rojo, como una ' +
      'crema catalana. Queda una capa crujiente.',
    creadaEn: FECHA_DEMO,
  },
]
