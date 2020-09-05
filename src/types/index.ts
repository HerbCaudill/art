export interface Point {
  x: number
  y: number
}

export interface Crack {
  start: Point
  angle: number
  length: number
  complete?: boolean
  parent?: Crack
}

export interface CrackMap {
  [k: string]: Crack
}
