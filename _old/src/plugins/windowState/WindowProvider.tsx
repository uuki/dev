import type { CSSVars } from './types'
import React from 'react'
import { useWindowState } from './useWindowState'

export const WindowProvider = ({ children, cssVars }: { children: React.ReactNode; cssVars: CSSVars }) => {
  useWindowState({ cssVars })

  return <>{children}</>
}
