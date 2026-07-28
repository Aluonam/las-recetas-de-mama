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

  /** "Nochebuena", "cumpleaños", "cuando alguien está malo". */
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

  /**
   * Grabación de quien cuenta la receta con su voz. Todavía sin interfaz,
   * pero la columna existe para no migrar después.
   */
  audioUrl?: string | null

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
  'Navidad',
  'Semana Santa',
  'Cumpleaños',
  'Domingos',
  'Verano',
  'Cuando alguien está malo',
  'Días de fiesta',
  'Del diario',
] as const

export const UNIDADES_SUGERIDAS = [
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
  'pizca',
  'rama',
  'hoja',
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
  }
}
