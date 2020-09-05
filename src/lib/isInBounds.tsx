import { Point } from '../types'
export const isInBounds = (
  pos: Point,
  width: number,
  height: number,
  offset: number = 0
) =>
  pos.x >= -offset &&
  pos.y >= -offset &&
  pos.x <= width + offset &&
  pos.y <= height + offset
