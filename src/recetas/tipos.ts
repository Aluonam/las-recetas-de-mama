/**
 * Modelo de dominio de una receta familiar.
 *
 * Decisión de diseño: el cuerpo de la receta (ingredientes, materiales,
 * pasos, trucos) viaja en columnas JSONB. Siempre se edita como una unidad
 * —nadie edita "el ingrediente 3" por su cuenta— así que partirlo en tablas
 * solo añadiría joins sin ganar nada. KISS.
 *
 * Las variantes sí son tabla aparte: las escribe otra persona, en otro
 * momento, sobre una receta que ya existe.
 */

/** Una cantidad puede ser exacta, "de la abuela", o las dos. */
export interface Ingrediente {
  id: string
  nombre: string
  /** Cantidad medible, si alguien se molestó en pesarlo. */
  cantidad?: number | null
  unidad?: string | null
  /**
   * Cómo se dice en casa: "un puñado", "un vaso de los del vino",
   * "harina la que admita". Si obligas a gramos, la receta deja de ser
   * la receta.
   */
  cantidadCasera?: string | null
  /** "de la que sea, pero mejor la de la lechera" */
  nota?: string | null
  /** "para la masa", "para el relleno". Vacío = grupo único. */
  grupo?: string | null
}

/** Cacharros. "La cazuela de barro" no es un detalle: a veces es la receta. */
export interface Material {
  id: string
  nombre: string
  nota?: string | null
}

export interface Paso {
  id: string
  texto: string
  fotoUrl?: string | null
  /**
   * La voz de quien lo explica, en este paso concreto.
   *
   * Hay pasos que escritos no se entienden —«hasta que la masa pida
   * más»— y contados en diez segundos sí. Es el mismo motivo que las
   * notas de voz por apartado, pero pegado al paso al que pertenecen.
   */
  audioUrl?: string | null
}

export interface Truco {
  id: string
  texto: string
  /** Quién lo decía. "La abuela siempre avisaba de esto." */
  deQuien?: string | null
}

export interface Foto {
  id: string
  url: string
  pie?: string | null
}

/**
 * Los apartados de la receta que admiten voz propia.
 *
 * No es una lista cualquiera: son los sitios donde alguien que cocina de
 * memoria tiene algo que decir que no cabe escrito.
 */
export type Apartado =
  | 'ingredientes'
  | 'pasos'
  | 'trucos'
  | 'especial'
  | 'procedencia'

export const NOMBRE_APARTADO: Record<Apartado, string> = {
  ingredientes: 'los ingredientes',
  pasos: 'la elaboración',
  trucos: 'los trucos',
  especial: 'por qué es especial',
  procedencia: 'de quién viene',
}

/**
 * Una nota de voz pegada a un apartado.
 *
 * La grabación de la receta entera está bien para quien se sienta a
 * contarla de principio a fin, pero no es así como se cuenta una receta
 * en una cocina: lo que sale son avisos sueltos —«las manzanas tienen
 * que quedar rectas por la base para que se asienten en el plato»— dicho
 * justo cuando toca y en dos frases.
 *
 * Eso escrito se pierde, porque nadie se para a escribirlo. Dicho, dura
 * diez segundos. Por eso cada apartado admite las suyas y no hay un
 * único audio para toda la receta.
 */
export interface AudioApartado {
  id: string
  apartado: Apartado
  url: string
  /** De qué va, en tres palabras. «Lo de la base plana.» */
  nota?: string | null
}

/** De quién viene la receta y por dónde ha pasado. El alma del archivo. */
export interface Procedencia {
  /** "La abuela Carmen" */
  autorNombre?: string | null
  /** "abuela", "tía", "vecina de toda la vida" */
  autorRelacion?: string | null
  /** "Ella la aprendió de su madre, Josefa, en el pueblo." */
  aprendidaDe?: string | null
  /** Año aproximado. Nadie lo sabe exacto y da igual. */
  anioOrigen?: number | null
}

export interface Receta {
  id: string
  titulo: string
  /** Una línea. "Las de siempre, las que hacía los domingos." */
  descripcion?: string | null

  procedencia: Procedencia

  /** Qué hace esta receta tan especial. */
  porQueEspecial?: string | null

  /** "Nochebuena", "Cumpleaños", "Enfermitos". */
  ocasiones: string[]

  /** Texto libre: "para 6, o para 4 si viene el tío". */
  raciones?: string | null
  tiempoMinutos?: number | null

  ingredientes: Ingrediente[]
  materiales: Material[]
  pasos: Paso[]
  trucos: Truco[]

  fotoPortadaUrl?: string | null
  fotos: Foto[]

  /** Grabación de quien cuenta la receta entera con su voz. */
  audioUrl?: string | null

  /** Notas de voz sueltas, cada una pegada a su apartado. */
  audios: AudioApartado[]

  creadaPor: string
  creadaEn: string
  actualizadaEn: string
}

/** Lo que se puede editar. El resto lo pone la base de datos. */
export type RecetaEditable = Omit<
  Receta,
  'id' | 'creadaPor' | 'creadaEn' | 'actualizadaEn'
>

/** Lo que necesita la portada del recetario, sin traerse la receta entera. */
export type RecetaResumen = Pick<
  Receta,
  'id' | 'titulo' | 'descripcion' | 'ocasiones' | 'fotoPortadaUrl' | 'tiempoMinutos'
> & { autorNombre?: string | null }

export const OCASIONES_SUGERIDAS = [
  'Nochebuena',
  'Semana Santa',
  'Cumpleaños',
  'Domingos',
  'Verano',
  'Enfermitos',
  'Días de fiesta',
  'De diario',
] as const

/**
 * Ocasiones que cambiaron de nombre o se retiraron.
 *
 * Los filtros salen de las ocasiones que tienen las recetas guardadas, no
 * de una lista fija, así que cambiar las sugerencias no basta: hay que
 * arreglar lo ya escrito. `null` significa que la ocasión desaparece.
 */
export const OCASIONES_RENOMBRADAS: Record<string, string | null> = {
  // Nochebuena ya cubre estas fechas y tenerlas las dos duplicaba el filtro.
  Navidad: null,
  'Del diario': 'De diario',
  'Cuando alguien está malo': 'Enfermitos',
}

/** Aplica los renombrados y quita las retiradas, sin repetir ninguna. */
export function normalizarOcasiones(ocasiones: string[]): string[] {
  const arregladas = ocasiones
    .map((ocasion) =>
      ocasion in OCASIONES_RENOMBRADAS ? OCASIONES_RENOMBRADAS[ocasion] : ocasion,
    )
    .filter((ocasion): ocasion is string => Boolean(ocasion))

  return [...new Set(arregladas)]
}

/**
 * Las medidas del desplegable de ingredientes.
 *
 * Primero lo que se pesa y se mide, que es lo que trae un paquete
 * escrito; después lo que se cuenta; y al final lo que se dice en casa.
 * Las tres últimas van sin número: «sal, al gusto» está completo, y
 * obligar a poner una cantidad ahí sería inventársela.
 */
export const MEDIDAS_SUGERIDAS = [
  'g',
  'kg',
  'ml',
  'l',
  'cucharada',
  'cucharadita',
  'taza',
  'vaso',
  'unidad',
  'diente',
  'rama',
  'hoja',
  'lata',
  'sobre',
  'puñado',
  'pizca',
  'chorro',
  'al gusto',
  'la que admita',
] as const

/**
 * Quita los datos que pone la base (id, autoría, fechas) y deja lo
 * editable. Vive aquí y no en el formulario: qué campos son metadatos es
 * asunto del modelo, no de la pantalla.
 */
export function aEditable(receta: Receta): RecetaEditable {
  // Campo a campo a propósito: si mañana se añade un campo editable, el
  // compilador avisa aquí en vez de dejarlo caer en silencio.
  return {
    titulo: receta.titulo,
    descripcion: receta.descripcion,
    procedencia: receta.procedencia,
    porQueEspecial: receta.porQueEspecial,
    ocasiones: receta.ocasiones,
    raciones: receta.raciones,
    tiempoMinutos: receta.tiempoMinutos,
    ingredientes: receta.ingredientes,
    materiales: receta.materiales,
    pasos: receta.pasos,
    trucos: receta.trucos,
    fotoPortadaUrl: receta.fotoPortadaUrl,
    fotos: receta.fotos,
    audioUrl: receta.audioUrl,
    audios: receta.audios,
  }
}

/** Receta en blanco para empezar a escribir. */
export function recetaVacia(): RecetaEditable {
  return {
    titulo: '',
    descripcion: '',
    procedencia: {},
    porQueEspecial: '',
    ocasiones: [],
    raciones: '',
    tiempoMinutos: null,
    ingredientes: [],
    materiales: [],
    pasos: [],
    trucos: [],
    fotoPortadaUrl: null,
    fotos: [],
    audioUrl: null,
    audios: [],
  }
}
