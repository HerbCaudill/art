export interface Position {
  x: number
  y: number
}

export interface Crack {
  start: Position
  angle: number
  length: number
  complete?: boolean
}
