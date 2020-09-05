import { Crack, Point } from '../types'
export const polarToXY = ({ start, angle, length }: Crack): Point => ({
  x: start.x + Math.cos(angle) * length,
  y: start.y + Math.sin(angle) * length,
})
