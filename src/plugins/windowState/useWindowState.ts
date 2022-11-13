import type { WindowState, CSSVars } from './types'
import React, { useEffect } from 'react'
import { debounce } from 'throttle-debounce'

type valueOf<T> = T[keyof T]

export type UseWindowStateProps = {
  cssVars: CSSVars
}

const getWindowState = (): WindowState => ({
  width: window.innerWidth,
  height: window.innerHeight,
  scrollX: window.pageXOffset,
  scrollY: window.pageYOffset,
  scrollBarSize: window.innerWidth - document.body.clientWidth,
})

export const useWindowState = ({ cssVars }: UseWindowStateProps) => {
  function update() {
    const state = getWindowState()
    Object.keys(state).forEach((key) => {
      document.documentElement.style.setProperty(
        cssVars[key as keyof WindowState],
        `${state[key as keyof WindowState]}px`
      )
    })
  }

  useEffect(() => {
    const handleScroll = update
    const handleResize = debounce(150, update)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [])
}

export const useWindowContext = ({ cssVars }: UseWindowStateProps) => {
  return Object.keys(cssVars).reduce((pre, key) => {
    const varKey = cssVars[key as keyof WindowState]
    const value = getComputedStyle(document.documentElement).getPropertyValue(varKey)

    pre[key as keyof WindowState] = parseFloat(value)
    return pre
  }, {} as WindowState)
}

export const getWindowPropertyValue = (key: valueOf<CSSVars>) => {
  return getComputedStyle(document.documentElement).getPropertyValue(key)
}
