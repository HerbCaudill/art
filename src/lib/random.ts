import { Point } from '../types'
import { TAU } from './constants'

export const random = {
  integer: (min: number, max: number) => Math.floor(random.decimal(min, max)),
  decimal: (min: number, max: number) => Math.random() * (max - min + 1) + min,
  normal: (min: number, max: number, skew = 1) => {
    let u = 0
    let v = 0
    while (u === 0) u = Math.random() //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random()
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

    num = num / 10.0 + 0.5 // Translate to 0 -> 1
    if (num > 1 || num < 0) num = random.normal(min, max, skew) // resample between 0 and 1 if out of range
    num = Math.pow(num, skew) // Skew
    num *= max - min // Stretch to fill range
    num += min // offset to min
    return num
  },

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

  point: (width: number, height: number): Point => ({
    x: random.integer(0, width),
    y: random.integer(0, height),
  }),
  plusOrMinus: () => random.pick([-1, 1]),
}
