export const nonBoolean = <T>(x: T | boolean): x is T => {
  return typeof x !== 'boolean'
}
