import { random } from '../lib'
import { ColorManager } from './ColorManager'
// import SandPainter from './SandPainter'

interface Position {
  x: number
  y: number
}

export default class Crack {
  public colorManager: ColorManager
  public width: number
  public height: number
  public makeCrack: () => void

  public x: number = 0
  public y: number = 0

  public angle: number = 0

  public done = false

  constructor(
    colorManager: ColorManager,
    width: number,
    height: number,
    makeCrack: () => void
  ) {
    this.colorManager = colorManager
    this.width = width
    this.height = height
    this.makeCrack = makeCrack
    this.findStart()
    // this.sp = new SandPainter(colors, stageW)
  }

  findStart() {
    let px = 0
    let py = 0

    // find an existing marked point on which to begin
    while (this.colorManager.crackGrid[py * this.width + px] === null) {
      px = random(0, this.width)
      py = random(0, this.height)
    }

    // start crack

    // choose an angle perpendicular to the existing one at this point
    const i = py * this.width + px
    const existingAngle = this.colorManager.crackGrid[i] as number
    const wobble = random(-2, 2, true)
    const plusOrMinus = random(0, 1) * 2 - 1
    this.angle = existingAngle + plusOrMinus * 90 + wobble

    const direction = (this.angle * Math.PI) / 180

    const fuzz = 0.85
    this.x = px + fuzz + Math.cos(direction)
    this.y = py + fuzz + Math.sin(direction)
  }

  move() {
    if (this.done) return
    const pixels = this.colorManager.pixels
    const crackGrid = this.colorManager.crackGrid

    // bound check
    const fuzz = 0.33
    const cx = (this.x + random(-fuzz, fuzz, true)) | 0
    const cy = (this.y + random(-fuzz, fuzz, true)) | 0

    // draw sand painter
    // this.regionColor()

    // draw black crack
    const lightness = 0.5 // 0 = darker, 1 = lighter
    const _i = (cy * this.width + cx) * 4
    pixels[_i] = pixels[_i] * lightness
    pixels[_i + 1] = pixels[_i + 1] * lightness
    pixels[_i + 2] = pixels[_i + 2] * lightness

    // continue cracking
    const dir = (this.angle * Math.PI) / 180
    const stepSize = 0.6
    this.x += stepSize * Math.cos(dir)
    this.y += stepSize * Math.sin(dir)

    const inBounds = cx >= 0 && cx < this.width && cy >= 0 && cy < this.height
    if (inBounds) {
      const i = cy * this.width + cx

      const angle = crackGrid[i]
      if (angle === null || Math.abs(angle - this.angle) < 5) {
        // continue cracking
        crackGrid[i] = this.angle
      } else if (Math.abs(angle - this.angle) > 2) {
        // crack encountered (not self), stop
        this.done = true
        // this.findStart()
        // this.makeCrack()
      }
    } else {
      // out of bounds, stop
      this.done = true
      // this.findStart()
      // this.makeCrack()
    }
  }

  // regionColor() {
  //   let rx = this.x
  //   let ry = this.y
  //   let openspace = true

  //   while (openspace) {
  //     const d = (this.t * Math.PI) / 180
  //     rx += 0.81 * Math.sin(d)
  //     ry -= 0.81 * Math.cos(d)

  //     if (rx >= 0 && rx < this.stageW && ry >= 0 && ry < this.stageH) {
  //       openspace = !(
  //         this.colorManager.cGrid[(ry * this.stageH + rx) | 0] < 10000
  //       )
  //     } else {
  //       openspace = false
  //     }
  //   }
  //   // this.sp.render(rx, ry, this.x, this.y)
  // }
}
