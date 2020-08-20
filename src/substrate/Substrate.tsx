import React from 'react'
import { Canvas, random } from '../lib'
import { ColorManager } from './ColorManager'
import Crack from './Crack'

export const Substrate = () => {
  const colorManager = new ColorManager()
  const maxCracks = 200
  let width = window.innerWidth
  let height = window.innerHeight
  const totalPixels = width * height

  let crackCount = 0
  let cracks = [] as Crack[]

  function makeCrack() {
    if (crackCount < maxCracks) {
      cracks[crackCount] = new Crack(colorManager, width, height, makeCrack)
      crackCount++
    }
  }

  const setup = (ctx: any) => {
    // fill with white
    ctx.fillStyle = '#FFF'
    ctx.fillRect(0, 0, width, height)

    colorManager.init(ctx)

    for (let i = 0; i < totalPixels * 4; i++) {
      colorManager.pixels[i] = 255
    }

    for (let i = 0; i < totalPixels; i++) {
      colorManager.crackGrid[i] = null
    }

    // seed a few spots for cracks
    for (let k = 0; k < 16; k++) {
      const c = random(0, totalPixels - 1)
      const angle = random(0, 360)
      colorManager.crackGrid[c] = angle
    }

    // randomly start three cracks
    for (let k = 0; k < 3; k++) {
      makeCrack()
    }
  }

  const draw = (ctx: any) => {
    for (let n = 0; n < crackCount; n++) cracks[n].move()
    if (random(0, 25) === 1) {
      for (let k = 0; k < crackCount / 2; k++) {
        makeCrack()
      }
    }
    ctx.putImageData(colorManager.imgData, 0, 0)
  }

  return <Canvas setup={setup} draw={draw} width={width} height={height} />
}
