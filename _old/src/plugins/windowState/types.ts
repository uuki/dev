export type WindowState = {
  width: number
  height: number
  scrollX: number
  scrollY: number
  scrollBarSize: number
}

export type CSSVars = {
  [key in keyof WindowState]: string
}
