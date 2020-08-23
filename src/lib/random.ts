import { Position } from '../types'
import { TAU } from './constants'

export const random = {
  integer: (min: number, max: number) => Math.floor(random.decimal(min, max)),
  decimal: (min: number, max: number) => Math.random() * (max - min + 1) + min,
  coinFlip: () => random.integer(0, 1) === 0,
  probability: (percent: number) => Math.random() < percent,
  angle: () => random.decimal(0, TAU * 2),

  pick: (obj: any[] | { [key: string]: any }): any => {
    if (Array.isArray(obj)) {
      // return random element of an array
      return obj[random.integer(0, obj.length - 1)]
    } else {
      // return random property of an object
      return obj[random.pick(Object.keys(obj))]
    }
  },

  point: (width: number, height: number): Position => ({
    x: random.integer(0, width),
    y: random.integer(0, height),
  }),
  plusOrMinus: () => random.pick([-1, 1]),
}
