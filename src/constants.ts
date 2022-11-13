import type { CSSVars } from '@/plugins/windowState'

export const portalSelector = '.portal' as const

export const cssVars = {
  width: '--global-window-inner-width',
  height: '--global-window-inner-height',
  scrollX: '--global-window-scroll-x',
  scrollY: '--global-window-scroll-y',
  scrollBarSize: '--global-window-scroll-bar-width',
} as CSSVars
