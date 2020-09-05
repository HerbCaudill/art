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

const width = window.innerWidth
const height = window.innerHeight

// const sides = [
//   { start: { x: 0, y: 0 }, angle: 0, length: width }, // top
//   { start: { x: width, y: 0 }, angle: TAU / 4, length: height }, // right
//   { start: { x: 0, y: height }, angle: 0, length: width }, // bottom
//   { start: { x: 0, y: 0 }, angle: TAU / 4, length: height }, // left
// ]

export const Substrate: React.FunctionComponent<SubstrateProps> = ({
  step = 50,
  seeds = 4,
  newCracks = 30,
  initialWobbleDegrees = 20,
  wobbleDegrees = 2,
  maxCracks = 10000,
  minMargin = 30,
  background = '#fff',
  color = 'rgba(0,0,0,1)',
  weight = 1,
  initialCracks = [],
}) => {
  const [cracks, setCracks] = useState<Crack[]>(initialCracks)
  const [done, setDone] = useState<boolean>(false)

  const extendCrack = (cracks: Crack[], crack: Crack) => {
    let { start, angle, length, complete } = crack

    // only extend active cracks
    if (!complete) {
      const end = polarToXY(crack) // the current endpoint of the crack
      const newEnd = polarToXY({ start, angle, length: length + step }) // the endpoint if we extend the crack

      // check to see if the extended crack would cross another crack
      const intersectingCracks = cracks.filter((other) => {
        if (other.start === crack.start) return false // don't intersect with ourselves

        const otherStart = other.start
        const otherEnd = polarToXY(other)
        return doIntersect(end, newEnd, otherStart, otherEnd)
      })

      if (intersectingCracks.length > 0) {
        // at least one intersection coming up
        const intersections = intersectingCracks
          .map((other) => {
            const otherStart = other.start
            const otherEnd = polarToXY(other)
            return findIntersection(end, newEnd, otherStart, otherEnd) as Point
          })
          .sort((a, b) => distance(b, newEnd) - distance(a, newEnd))

        // extend to the closest intersection
        const closestIntersection = intersections[0]
        length = distance(closestIntersection, start)

        // stop cracking
        complete = true
      } else if (!isInBounds(newEnd, width, height, step)) {
        // out of bounds; stop cracking
        complete = true
      } else {
        // keep cracking
        length += step
      }
      return { ...crack, length, complete }
    } else {
      return crack
    }
  }

  const allComplete = (cracks: Crack[]) =>
    !cracks.some((crack) => crack.complete !== true)

  const randomPointOnCrack = (crack: Crack, cracks: Crack[]): Point => {
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

  const newCrack = (cracks: Crack[]) => {
    if (cracks.length < seeds) {
      // pick a random spot on an edge
      // const start = random.pick([
      //   { x: random.pick([0, width]), y: random.integer(0, height) }, // on horizontal edge
      //   { x: random.integer(0, width), y: random.pick([0, height]) }, // on vertical edge
      // ])
      const start = {
        x: random.integer(0, width),
        y: random.integer(0, height),
      }
      const angle = kindaPerpendicular(
        (random.integer(0, 7) * TAU) / 4,
        initialWobbleDegrees
      )
      return { start, angle, length: minMargin * 2 + 1, parent: undefined }
    } else {
      // pick a random spot on an existing crack
      const parent = random.pick(
        cracks.filter((c) => c.length > minMargin * 2)
      ) as Crack
      const start = randomPointOnCrack(parent, cracks)
      // set angle to be roughly perpendicular to the existing crack's angle
      const angle = kindaPerpendicular(parent.angle, wobbleDegrees)
      console.groupEnd()

      return { start, angle, length: 1, parent }
    }
  }

  const draw = (f: number) => {
    setCracks((cracks) => {
      if (!done) {
        // extend each crack
        cracks = [...cracks]
        for (let i = 0; i < cracks.length; i++) {
          cracks[i] = extendCrack(cracks, cracks[i])
        }

        // cracks = cracks.reduce(
        //   (newCracks, crack) => newCracks.concat(extendCrack(newCracks, crack)),
        //   [] as Crack[]
        // )

        // maybe start some new cracks
        if (cracks.length >= maxCracks) {
          if (allComplete(cracks)) setDone(true)
        } else {
          for (let i = 0; i < newCracks; i++) {
            cracks.push(newCrack(cracks))
          }
        }
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

interface SubstrateProps {
  step?: number
  seeds?: number
  newCracks?: number
  initialWobbleDegrees?: number
  wobbleDegrees?: number
  maxCracks?: number
  minMargin?: number
  background?: string
  color?: string
  weight?: number
  initialCracks?: Crack[]
}
