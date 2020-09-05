import { distance } from './distance'
import { Point } from '../types'
export const byDistanceTo = (point: Point) => (a: Point, b: Point) =>
  distance(b, point) - distance(a, point)
