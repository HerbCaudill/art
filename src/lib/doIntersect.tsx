import { Point } from '../types'

export enum Orientation {
  COLINEAR,
  CLOCKWISE,
  COUNTERCLOCKWISE,
}

/**
 * Given three colinear points p, q, r, the function checks if point q lies on line segment 'pr'
 */
const onSegment = (p: Point, q: Point, r: Point) => {
  if (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  )
    return true

  return false
}

/**
 * To find orientation of ordered triplet (p, q, r).
 *
 * The function returns following values
 * 0 --> p, q and r are colinear
 * 1 --> Clockwise
 * 2 --> Counterclockwise
 */
const orientation = (p: Point, q: Point, r: Point) => {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)
  if (val === 0) return Orientation.COLINEAR
  return val > 0 ? Orientation.CLOCKWISE : Orientation.COUNTERCLOCKWISE
}

/**
 *  The main function that returns true if line segment 'p1q1' and 'p2q2' intersect.
 */
export const doIntersect = (p1: Point, q1: Point, p2: Point, q2: Point) => {
  // Find the four orientations needed for general and
  // special cases
  const o1 = orientation(p1, q1, p2)
  const o2 = orientation(p1, q1, q2)
  const o3 = orientation(p2, q2, p1)
  const o4 = orientation(p2, q2, q1)

  if (
    (o1 !== o2 && o3 !== o4) ||
    (o1 === Orientation.COLINEAR && onSegment(p1, p2, q1)) ||
    (o2 === Orientation.COLINEAR && onSegment(p1, q2, q1)) ||
    (o3 === Orientation.COLINEAR && onSegment(p2, p1, q2)) ||
    (o4 === Orientation.COLINEAR && onSegment(p2, q1, q2))
  )
    return true
  return false
}
