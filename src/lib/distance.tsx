import { Point } from '../types'
export const distance = (p: Point, q: Point): number =>
  Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2)
