import { random } from '.'
import { TAU } from './constants'
export const kindaPerpendicular = (angle: number, wobbleRange = 2) => {
  const wobble = (random.decimal(-wobbleRange, wobbleRange) * TAU) / 360
  const newAngle = angle + wobble + (random.plusOrMinus() * TAU) / 4
  return newAngle
}
