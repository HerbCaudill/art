import React from 'react'
import { Canvas, random } from '../lib'
import { doIntersect } from '../lib/doIntersect'
import { Crack, Position } from '../types'

const TAU = 2 * Math.PI

const STEP = 1.5
const SEED_COUNT = 10
const NEW_CRACK_FREQUENCY = 25 // out of 100
const WOBBLE = 2

const coinflip = () => random(0, 1) === 0

export const Substrate = () => {
  const width = window.innerWidth
  const height = window.innerHeight

  const cracks: Crack[] = []

  const newCrack = () => {
    let start: Position
    let angle: number
    if (cracks.length < SEED_COUNT) {
      // pick a random spot on the canvas
      start = { x: random(0, width), y: random(0, height) }
      // pick a random angle
      angle = random(0, TAU, true)
      // add two cracks at 180 degrees from each other

      return [
        { start, angle, length: STEP },
        { start, angle: angle + TAU, length: STEP },
      ]
    } else {
      // pick a random spot along an existing crack
      const existingCrack = pickRandom(cracks)
      start = randomPointOnCrack(existingCrack)
      // set angle to be roughly perpendicular to the existing crack's angle
      angle = kindaPerpendicular(existingCrack.angle)
      return [{ start, angle, length: STEP }]
    }
  }

  const extendCrack = (crack: Crack) => {
    const { start, angle, length, complete } = crack
    if (!complete) {
      const end: Position = getEnd(crack)
      const newEnd: Position = getEnd({ start, angle, length: length + STEP })

      const intersects = cracks.some(
        (otherCrack) =>
          otherCrack !== crack &&
          doIntersect(end, newEnd, otherCrack.start, getEnd(otherCrack))
      )

      if (!isInBounds(newEnd) || intersects) {
        crack.complete = true
      } else {
        crack.length += STEP
      }
    }
  }

  const isInBounds = (pos: Position) =>
    pos.x >= 0 && pos.y >= 0 && pos.x <= width && pos.y <= height

  const getEnd = ({ start, angle, length }: Crack): Position => ({
    x: start.x + Math.cos(angle) * length,
    y: start.y + Math.sin(angle) * length,
  })

  const setup = (ctx: any) => {
    ctx.strokeStyle = `rgb(0,0,0,.25)`
    ctx.lineWidth = 3
  }

  const draw = (ctx: CanvasRenderingContext2D, frameCount: number) => {
    // extend each crack
    cracks.forEach(extendCrack)

    // maybe start some new cracks
    if (random(0, 100) <= NEW_CRACK_FREQUENCY) cracks.push(...newCrack())

    // clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

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

const pickRandom = (arr: any[]) => arr[random(0, arr.length - 1)]

const kindaPerpendicular = (angle: number) => {
  const wobble = (random(-WOBBLE, WOBBLE, true) * TAU) / 90
  const plusOrMinus = pickRandom([-1, 1])
  const newAngle = angle + wobble + (plusOrMinus * TAU) / 4
  return newAngle
}

const randomPointOnCrack = (crack: Crack) => {
  const { start, angle, length } = crack
  const distance = random(0, length, true)
  return {
    x: start.x + Math.cos(angle) * distance,
    y: start.y + Math.sin(angle) * distance,
  }
}
