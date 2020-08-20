export const random = (min, max, isFloat = false) => {
  const result = Math.random() * (max - min) + min
  return isFloat ? result : Math.floor(result)
}
