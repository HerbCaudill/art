import { Position } from '../types'
import { TAU } from './constants'

export const random = {
  integer: (min: number, max: number) => Math.floor(random.decimal(min, max)),
  decimal: (min: number, max: number) => Math.random() * (max - min + 1) + min,
  coinFlip: () => random.integer(0, 1) === 0,
  probability: (percent: number) => Math.random() < percent,
  angle: () => random.decimal(0, TAU * 2),
  pick: (arr: any[]) => arr[random.integer(0, arr.length - 1)],
  point: (width: number, height: number): Position => ({
    x: random.integer(0, width),
    y: random.integer(0, height),
  }),
  plusOrMinus: () => random.pick([-1, 1]),
}
