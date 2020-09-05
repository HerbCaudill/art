import React, { useState } from 'react'
import { random } from '../lib'
import { TAU } from '../lib/constants'
import { distance } from '../lib/distance'
import { doIntersect } from '../lib/doIntersect'
import { findIntersection } from '../lib/findIntersection'
import { Svg } from '../lib/Svg'
import { Crack, Point } from '../types'

// next

// parameters
const STEP = 1
const SEED_COUNT = 3
const NEW_CRACK_FREQUENCY = 2
const WOBBLE_DEGREES = 2
const MAX_CRACKS = 3000
const MIN_MARGIN = 30

const BACKGROUND = '#fff'
const COLOR = 'rgba(100,100,100,1)'
const WEIGHT = 3

const width = window.innerWidth - 1
const height = window.innerHeight - 1

const initialCracks: Crack[] = [
  // { start: { x: 0, y: 0 }, angle: 0, length: width }, // top
  // { start: { x: width, y: 0 }, angle: TAU / 4, length: height }, // right
  // { start: { x: 0, y: height }, angle: 0, length: width }, // bottom
  // { start: { x: 0, y: 0 }, angle: TAU / 4, length: height }, // left
]

export const Substrate = () => {
  const [cracks, setCracks] = useState<Crack[]>(initialCracks)
  const [done, setDone] = useState<boolean>(false)

  const kindaPerpendicular = (angle: number, wobbleRange = WOBBLE_DEGREES) => {
    const wobble = (random.decimal(-wobbleRange, wobbleRange) * TAU) / 360
    const newAngle = angle + wobble + (random.plusOrMinus() * TAU) / 4
    return newAngle
  }

  const getEnd = ({ start, angle, length }: Crack): Point => ({
    x: start.x + Math.cos(angle) * length,
    y: start.y + Math.sin(angle) * length,
  })

  const isInBounds = (pos: Point, width: number, height: number) =>
    pos.x >= 0 && pos.y >= 0 && pos.x <= width && pos.y <= height

  const extendCrack = (cracks: Crack[]) => (crack: Crack) => {
    let { start, angle, length, complete } = crack

    // only extend active cracks
    if (!complete) {
      const end = getEnd(crack) // the current endpoint of the crack
      const newEnd = getEnd({ start, angle, length: length + STEP }) // the endpoint if we extend the crack

      // check to see if the extended crack would cross another crack
      const intersectingCracks = cracks.filter((other) => {
        if (other.start === crack.start) return false // don't intersect with ourselves

        const otherStart = other.start
        const otherEnd = getEnd(other)
        return doIntersect(end, newEnd, otherStart, otherEnd)
      })

      if (intersectingCracks.length > 0) {
        // at least one intersection coming up
        const intersections = intersectingCracks
          .map((other) => {
            const otherStart = other.start
            const otherEnd = getEnd(other)
            return findIntersection(end, newEnd, otherStart, otherEnd) as Point
          })
          .sort((a, b) => distance(b, newEnd) - distance(a, newEnd))

        // extend to the closest intersection
        const closestIntersection = intersections[0]
        length = distance(closestIntersection, start)

        // stop cracking
        complete = true
      } else if (!isInBounds(newEnd, width, height)) {
        // out of bounds; stop cracking
        complete = true
      } else {
        // keep cracking
        length += STEP
      }
      return { ...crack, length, complete }
    } else {
      return crack
    }
  }

  function allComplete(cracks: Crack[]) {
    return !cracks.some((crack) => crack.complete !== true)
  }

  const randomPointOnCrack = (crack: Crack, cracks: Crack[]): Point => {
    const { start, angle, length } = crack
    let attempts = 0
    while (true) {
      // find a point on this crack that is not uncomfortably close to other points on this crack

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
        closestSibling > MIN_MARGIN
      )
        return point
    }
  }

  const newCrack = (cracks: Crack[]) => {
    if (cracks.length < SEED_COUNT) {
      // pick a random spot on an edge
      // const start = random.pick([
      //   { x: random.pick([0, width]), y: random.integer(0, height) }, // on horizontal edge
      //   { x: random.integer(0, width), y: random.pick([0, height]) }, // on vertical edge
      // ])
      const start = {
        x: random.integer(0, width),
        y: random.integer(0, height),
      }
      const angle = kindaPerpendicular(random.pick([0, TAU / 4]), 20)
      return { start, angle, length: MIN_MARGIN * 2 + 1, parent: undefined }
    } else {
      // pick a random spot on an existing crack
      const parent = random.pick(
        cracks.filter((c) => c.length > MIN_MARGIN * 2)
      ) as Crack
      console.group('finding point on parent')
      console.log({ parent })
      const start = randomPointOnCrack(parent, cracks)
      // set angle to be roughly perpendicular to the existing crack's angle
      const angle = kindaPerpendicular(parent.angle)
      console.groupEnd()

      return { start, angle, length: 1, parent }
    }
  }

  const draw = (f: number) => {
    setCracks((cracks) => {
      if (!done) {
        // console.log('draw', cracks.length)
        // extend each crack
        cracks = cracks.map(extendCrack(cracks))

        // maybe start some new cracks
        if (cracks.length >= MAX_CRACKS) {
          if (allComplete(cracks)) setDone(true)
        } else {
          for (let i = 0; i < NEW_CRACK_FREQUENCY; i++) {
            cracks.push(newCrack(cracks))
          }
        }
      }
      return cracks
    })
  }

  return (
    <Svg width={width} height={height} draw={draw} done={done}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        style={{ fill: BACKGROUND }}
      />

      {cracks.map((crack, i) => {
        const { start, angle, length } = crack
        const end = getEnd({ start, angle, length })
        return (
          <line
            key={i}
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            style={{ stroke: COLOR, strokeWidth: WEIGHT }}
          />
        )
      })}
    </Svg>
  )
}

const ascending = (a: number, b: number) => a - b
