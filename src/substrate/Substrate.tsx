import React, { useState } from 'react'
import { random } from '../lib'
import { TAU } from '../lib/constants'
import { distance } from '../lib/distance'
import { doIntersect } from '../lib/doIntersect'
import { findIntersection } from '../lib/findIntersection'
import { Svg } from '../lib/Svg'
import { Crack, Point } from '../types'
import { ascending } from '../lib/ascending'
import { polarToXY } from '../lib/polarToXY'
import { isInBounds } from '../lib/isInBounds'
import { kindaPerpendicular } from '../lib/kindaPerpendicular'
import { byDistanceTo } from '../lib/byDistanceTo'

const width = window.innerWidth
const height = window.innerHeight

// const sides = [
//   { start: { x: 0, y: 0 }, angle: 0, length: width }, // top
//   { start: { x: width, y: 0 }, angle: TAU / 4, length: height }, // right
//   { start: { x: 0, y: height }, angle: 0, length: width }, // bottom
//   { start: { x: 0, y: 0 }, angle: TAU / 4, length: height }, // left
// ]

export const Substrate: React.FunctionComponent<SubstrateProps> = ({
  step = 150,
  seedCount = 4,
  newCracksPerCycle = 30,
  unanchoredWobbleDegrees = 20,
  wobbleDegrees = 3,
  maxCracks = 1000,
  minMargin = 30,
  background = '#fff',
  color = 'rgba(0,0,0,1)',
  weight = 1,
  initialCracks = [],
}) => {
  const [cracks, setCracks] = useState<Crack[]>(initialCracks)
  const [done, setDone] = useState<boolean>(false)

  const draw = (f: number) => {
    setCracks((cracks) => {
      // extend each crack
      cracks = extendEach(cracks, step)

      // have we made enough cracks?
      if (cracks.length < maxCracks) {
        // nope, make more
        for (let i = 0; i < newCracksPerCycle; i++)
          cracks.push(
            cracks.length < seedCount
              ? unanchoredCrack(unanchoredWobbleDegrees, minMargin)
              : anchoredCrack(cracks, minMargin, wobbleDegrees)
          )
      } else {
        // check whether we're done drawing all outstanding cracks
        if (allComplete(cracks)) setDone(true)
      }
      return cracks
    })
  }

  return (
    <Svg
      width={width}
      height={height}
      draw={draw}
      done={done}
      background={background}
    >
      {cracks.map((crack, i) => {
        const { start, angle, length } = crack
        const end = polarToXY({ start, angle, length })
        return (
          <line
            key={i}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            style={{ stroke: color, strokeWidth: weight }}
          />
        )
      })}
    </Svg>
  )
}

const extendEach = (_cracks: Crack[], step: number) => {
  const cracks = [..._cracks]
  for (const i in cracks) cracks[i] = extendCrack(cracks, cracks[i], step)
  return cracks
}

const extendCrack = (cracks: Crack[], crack: Crack, step: number) => {
  const { start, angle } = crack // these never change
  let { length, complete } = crack // these are what we are

  // only extend active cracks
  if (complete) return crack

  const end = polarToXY(crack) // the current endpoint of the crack
  const newEnd = polarToXY({ start, angle, length: length + step }) // the endpoint if we extend the crack

  // check to see if the extended crack would cross another crack
  const crackIntersectsWithExtension = (other: Crack): boolean => {
    // don't intersect with ourselves
    if (other.start === crack.start) return false

    const otherStart = other.start
    const otherEnd = polarToXY(other)
    return doIntersect(end, newEnd, otherStart, otherEnd)
  }

  const intersectingCracks = cracks.filter(crackIntersectsWithExtension)

  if (intersectingCracks.length > 0) {
    // at least one intersection coming up; find the closest one
    const closestIntersection = intersectingCracks
      .map((other) => {
        const otherStart = other.start
        const otherEnd = polarToXY(other)
        return findIntersection(end, newEnd, otherStart, otherEnd) as Point
      })
      .sort(byDistanceTo(newEnd))[0]

    // extend to the closest intersection & stop cracking
    length = distance(closestIntersection, start)
    complete = true
  } else if (!isInBounds(newEnd, width, height, step)) {
    // out of bounds; stop cracking
    complete = true
  } else {
    // keep cracking
    length += step
  }
  return { ...crack, length, complete }
}

const allComplete = (cracks: Crack[]) =>
  !cracks.some((crack) => crack.complete !== true)

const randomPointOnCrack = (
  crack: Crack,
  cracks: Crack[],
  minMargin: number
): Point => {
  const { start, angle, length } = crack
  let attempts = 0
  // find a point on this crack that is not uncomfortably close to other points on this crack
  while (true) {
    const linearPosition = random.decimal(0, length) // distance from crack start
    const point: Point = {
      x: start.x + Math.cos(angle) * linearPosition,
      y: start.y + Math.sin(angle) * linearPosition,
    }
    const siblingCracks = cracks.filter((c) => c.parent === crack)
    const closestSibling = siblingCracks
      .map((c) => distance(c.start, point))
      .sort(ascending)[0]

    if (
      attempts++ > 100 ||
      closestSibling === undefined ||
      closestSibling > minMargin
    )
      return point
  }
}

const unanchoredCrack = (
  unanchoredWobbleDegrees: number,
  minMargin: number
) => {
  const start = {
    x: random.integer(0, width),
    y: random.integer(0, height),
  }
  const angle = kindaPerpendicular(
    (random.integer(0, 7) * TAU) / 4,
    unanchoredWobbleDegrees
  )
  return { start, angle, length: minMargin * 2 + 1, parent: undefined }
}

const anchoredCrack = (
  cracks: Crack[],
  minMargin: number,
  wobbleDegrees: number
) => {
  // pick a random crack of suitable length
  const suitablyLongCracks = cracks.filter((c) => c.length > minMargin * 2)
  const parent = random.pick(suitablyLongCracks)

  // pick a random point on that crack
  const start = randomPointOnCrack(parent, cracks, minMargin)

  // set angle to be roughly perpendicular to the existing crack's angle
  const angle = kindaPerpendicular(parent.angle, wobbleDegrees)

  return { start, angle, length: 1, parent }
}

interface SubstrateProps {
  step?: number
  seedCount?: number
  newCracksPerCycle?: number
  unanchoredWobbleDegrees?: number
  wobbleDegrees?: number
  maxCracks?: number
  minMargin?: number
  background?: string
  color?: string
  weight?: number
  initialCracks?: Crack[]
}
