import { random } from '../lib'
import { ColorManager } from './ColorManager'
// import SandPainter from './SandPainter'

export default class Crack {
  public colorManager: ColorManager
  public stageW: number
  public stageH: number
  public makeCrack: () => void
  public x: number = 0
  public y: number = 0
  public t: number = 0

  constructor(
    colorManager: ColorManager,
    width: number,
    height: number,
    makeCrack: () => void
  ) {
    this.colorManager = colorManager
    this.stageW = width
    this.stageH = height
    this.makeCrack = makeCrack
    this.findStart()
    // this.sp = new SandPainter(colors, stageW)
  }

  findStart() {
    let px = 0
    let py = 0
    let found = false

    while (!found) {
      px = random(0, this.stageW)
      py = random(0, this.stageH)
      found = this.colorManager.cGrid[py * this.stageW + px] < 10000
    }

    // start crack
    let a = this.colorManager.cGrid[py * this.stageW + px]

    if (random(0, 100) < 50) {
      a -= 90 + random(-2, 2.1, true)
    } else {
      a += 90 + random(-2, 2.1, true)
    }
    this.startCrack(px, py, a)
  }

  startCrack(x: number, y: number, t: number) {
    const _dir = (t * Math.PI) / 180
    this.x = x + 0.61 * Math.cos(_dir)
    this.y = y + 0.61 * Math.sin(_dir)
    this.t = t
  }

  move() {
    const pixels = this.colorManager.pixels
    const cGrid = this.colorManager.cGrid

    // bound check
    const z = 0.33
    const cx = (this.x + random(-z, z, true)) | 0
    const cy = (this.y + random(-z, z, true)) | 0

    const _dir = (this.t * Math.PI) / 180
    const _i = (cy * this.stageW + cx) * 4

    // continue cracking
    this.x += 0.42 * Math.cos(_dir)
    this.y += 0.42 * Math.sin(_dir)

    // draw sand painter
    // this.regionColor()

    // draw black crack
    pixels[_i] = pixels[_i] * 0.9
    pixels[_i + 1] = pixels[_i + 1] * 0.9
    pixels[_i + 2] = pixels[_i + 2] * 0.9

    if (cx >= 0 && cx < this.stageW && cy >= 0 && cy < this.stageH) {
      // safe to check
      const i = cy * this.stageW + cx

      if (cGrid[i] > 10000 || Math.abs(cGrid[i] - this.t) < 5) {
        // continue cracking
        cGrid[i] = this.t
      } else if (Math.abs(cGrid[i] - this.t) > 2) {
        // crack encountered (not self), stop cracking
        this.findStart()
        this.makeCrack()
      }
    } else {
      // out of bounds, stop cracking
      this.findStart()
      this.makeCrack()
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
