export function random(min, max, isFloat) {
  let random = Math.floor(Math.random() * (max - min)) + min

  if (isFloat) {
    random = Math.random() * (max - min) + min
  }

  return random
}
