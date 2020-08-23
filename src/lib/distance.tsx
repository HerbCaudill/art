import { Position } from '../types'
export const distance = (p: Position, q: Position): number =>
  Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2)
