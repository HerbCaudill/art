import React from 'react'
import { Canvas, random } from '../lib'

const TAU = 2 * Math.PI

const step = 0.5
const seedCount = 3

export const Substrate = () => {
  const width = window.innerWidth
  const height = window.innerHeight

  const cracks: Crack[] = []

  const newCrack = () => {
    if (cracks.length <= seedCount) {
      // pick a random spot on the canvas
      const pos: Position = {
        x: random(0, width),
        y: random(0, height),
      }
      // pick a random angle
      const angle = random(0, TAU, true)
    } else {
      // pick a random spot along an existing crack
      const crack = pickRandom(cracks)
      const length = random(0, crack.length, true)
    }
  }

  const extendCrack = (crack: Crack) => {}

  const setup = (ctx: any) => {
    newCrack()
  }

  const draw = (ctx: CanvasRenderingContext2D, frameCount: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    cracks.forEach(extendCrack)
  }

  return <Canvas setup={setup} draw={draw} width={width} height={height} />
}

interface Position {
  x: number
  y: number
}

interface Crack {
  start: Position
  angle: number
  length: number
  complete: boolean
}

const pickRandom = (arr: any[]) => arr[random(0, arr.length - 1)]
