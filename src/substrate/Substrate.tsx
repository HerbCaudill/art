import React, { useState, useEffect } from 'react'
import { random } from '../lib'
import { TAU } from '../lib/constants'
import { distance } from '../lib/distance'
import { findIntersection } from '../lib/findIntersection'
import { Crack, Position } from '../types'
import { doIntersect } from '../lib/doIntersect'

// parameters
const STEP = 10
const SEED_COUNT = 20
const NEW_CRACK_FREQUENCY = 1
const WOBBLE = 3

const BACKGROUND = 'white'
const COLOR = 'rgba(0,0,255,1)'
const WEIGHT = 2

const width = window.innerWidth
const height = window.innerHeight

const initialCracks: Crack[] = []
export const Substrate = () => {
  const [cracks, setCracks] = useState(initialCracks)

  useEffect(() => {
    let frameCount = 0
    let animationFrameId: number

    window.requestAnimationFrame(update)
    const cleanup = () => window.cancelAnimationFrame(animationFrameId)
    return cleanup
  }, [])

  const update = () => {
    setCracks((prev) => {
      const newCrack = () => {
        let start: Position
        let angle: number
        if (prev.length < SEED_COUNT) {
          // pick a random spot on an edge
          start = random.pick([
            { x: random.pick([0, width]), y: random.integer(0, height) }, // on horizontal edge
            { x: random.integer(0, width), y: random.pick([0, height]) }, // on vertical edge
          ])
          angle = random.angle()
        } else {
          // pick a random spot on an existing crack
          const existingCrack = random.pick(prev)
          start = randomPointOnCrack(existingCrack)
          // set angle to be roughly perpendicular to the existing crack's angle
          angle = kindaPerpendicular(existingCrack.angle)
        }
        return { start, angle, length: STEP }
      }

      const extendCrack = (crack: Crack) => {
        let { start, angle, length, complete } = crack

        // only extend active cracks
        if (!complete) {
          const end: Position = getEnd(crack) // the current endpoint of the crack
          const newEnd: Position = getEnd({
            start,
            angle,
            length: length + STEP,
          }) // the endpoint if we extend the crack

          // check to see if we're in bounds
          const outOfBounds = !isInBounds(newEnd, width, height)

          // check to see if the extended crack would cross another crack
          const intersectingCracks = prev.filter((other) => {
            if (other.start === crack.start) return false // don't intersect with ourselves

            const otherStart = other.start
            const otherEnd = getEnd(other)
            return doIntersect(end, newEnd, otherStart, otherEnd)
          })

          if (intersectingCracks.length > 0) {
            const intersections = intersectingCracks
              .map((other) => {
                const otherStart = other.start
                const otherEnd = getEnd(other)
                return findIntersection(
                  end,
                  newEnd,
                  otherStart,
                  otherEnd
                ) as Position
              })
              .sort((a, b) => distance(b, newEnd) - distance(a, newEnd))
            const closestIntersection = intersections[0]
            length = distance(closestIntersection, start)
            complete = true
          } else if (outOfBounds) {
            complete = true
          } else {
            length += STEP
          }
          return { start, angle, length, complete }
        } else {
          return crack
        }
      }

      // extend each crack
      let updatedCracks = prev.map(extendCrack)

      // maybe start some new cracks
      if (random.probability(NEW_CRACK_FREQUENCY))
        updatedCracks.push(newCrack())

      return updatedCracks
    })
    window.requestAnimationFrame(update)
  }

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
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
            ></line>
          )
        })}
      </svg>
    </div>
  )
}

const kindaPerpendicular = (angle: number) => {
  const wobble = (random.decimal(-WOBBLE, WOBBLE) * TAU) / 360
  const newAngle = angle + wobble + (random.plusOrMinus() * TAU) / 4
  return newAngle
}

const randomPointOnCrack = (crack: Crack) => {
  const { start, angle, length } = crack
  const distance = random.decimal(0, length)
  return {
    x: start.x + Math.cos(angle) * distance,
    y: start.y + Math.sin(angle) * distance,
  }
}

const getEnd = ({ start, angle, length }: Crack): Position => ({
  x: start.x + Math.cos(angle) * length,
  y: start.y + Math.sin(angle) * length,
})

const isInBounds = (pos: Position, width: number, height: number) =>
  pos.x >= 0 && pos.y >= 0 && pos.x <= width && pos.y <= height
