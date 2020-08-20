import { random } from '../lib'

export class ColorManager {
  public goodColors: number[][]
  public pixels: any
  public crackGrid: (number | null)[]

  public imgData?: ImageData

  constructor() {
    this.goodColors = [[0, 0, 0]]
    this.pixels = []
    this.crackGrid = []
  }

  init(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas
    this.imgData = ctx.getImageData(0, 0, width, height)
    this.pixels = this.imgData.data
  }

  someColor() {
    return this.goodColors[random(0, this.goodColors.length)]
  }
}
