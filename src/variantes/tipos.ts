/** "La versión de mamá: menos nuez moscada." */
export interface Variante {
  id: string
  recetaId: string
  /** Quién la hace así. */
  autorNombre: string
  titulo: string
  texto: string
  creadaEn: string
}

export type VarianteNueva = Pick<Variante, 'autorNombre' | 'titulo' | 'texto'>
