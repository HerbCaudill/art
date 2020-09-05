import React from 'react'
import { Canvas, random } from '../lib'
import { Crack, Point } from '../types'
import { TAU } from '../lib/constants'
import { findIntersection } from '../lib/findIntersection'
import { distance } from '../lib/distance'

// parameters
const STEP = 10
const SEED_COUNT = 10
const NEW_CRACK_FREQUENCY = 1
const WOBBLE = 3

const BACKGROUND = 'white'
const COLOR = 'rgba(0,0,255,.5)'
const WEIGHT = 2

export const Substrate = () => {
  const width = window.innerWidth
  const height = window.innerHeight

  const setup = (ctx: any) => {
    ctx.strokeStyle = COLOR
    ctx.lineWidth = WEIGHT
  }

  // start with 4 edges as "cracks"
  const cracks: Crack[] = [
    { start: { x: 1, y: 1 }, angle: 0, length: width },
    { start: { x: 1, y: 1 }, angle: TAU / 4, length: height },
    { start: { x: 1, y: height - 1 }, angle: 0, length: width },
    { start: { x: width - 1, y: 1 }, angle: TAU / 4, length: height },
  ]

  const newCrack = () => {
    let start: Point
    let angle: number
    if (cracks.length < SEED_COUNT) {
      // pick a random spot on the canvas
      start = { x: random.integer(0, width), y: random.integer(0, height) }
      // pick a random angle
      angle = random.angle()
      return [{ start, angle, length: STEP }]
    } else {
      // pick a random spot along an existing crack
      const existingCrack = random.pick(cracks)
      start = randomPointOnCrack(existingCrack)
      // set angle to be roughly perpendicular to the existing crack's angle
      angle = kindaPerpendicular(existingCrack.angle)
      return [{ start, angle, length: STEP }]
    }
  }

  const extendCrack = (crack: Crack) => {
    const { start, angle, length, complete } = crack

    // only extend active cracks
    if (!complete) {
      const end: Point = getEnd(crack) // the current endpoint of the crack
      const newEnd: Point = getEnd({ start, angle, length: length + STEP }) // the endpoint if we extend the crack

      // check to see if the extended crack would cross another crack
      const willIntersect = cracks.find((other) => {
        if (other.start === crack.start) return false // don't intersect with ourselves

        const otherStart = other.start
        const otherEnd = getEnd(other)
        const intersection = findIntersection(end, newEnd, otherStart, otherEnd)
        if (intersection) {
          crack.length = distance(start, intersection)
          crack.complete = true
        }

        return !!intersection
      })

      const isInBounds = (pos: Point) =>
        pos.x >= 0 && pos.y >= 0 && pos.x <= width && pos.y <= height

      if (!willIntersect && isInBounds(newEnd)) crack.length += STEP
    }
  }

  const draw = (ctx: CanvasRenderingContext2D, frameCount: number) => {
    // extend each crack
    cracks.forEach(extendCrack)

    // maybe start some new cracks
    if (random.probability(NEW_CRACK_FREQUENCY)) cracks.push(...newCrack())

    // clear canvas
    ctx.fillStyle = BACKGROUND
    ctx.fillRect(0, 0, width, height)

    // render each crack
    const renderCrack = ({ start, angle, length }: Crack): void => {
      const end = getEnd({ start, angle, length })

      ctx.beginPath()
      ctx.moveTo(start.x, start.y)
      ctx.lineTo(end.x, end.y)
      ctx.stroke()
    }
    cracks.forEach(renderCrack)
  }

  return <Canvas setup={setup} draw={draw} width={width} height={height} />
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

const getEnd = ({ start, angle, length }: Crack): Point => ({
  x: start.x + Math.cos(angle) * length,
  y: start.y + Math.sin(angle) * length,
})
