export const random = (min, max, isFloat = false) => {
  const result = Math.random() * (max - min + 1) + min
  return isFloat ? result : Math.floor(result)
}
