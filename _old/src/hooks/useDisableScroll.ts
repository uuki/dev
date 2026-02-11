import React, { useState, useCallback, useContext } from 'react'
import { getWindowPropertyValue } from '@/plugins/windowState'
import { cssVars } from '@/constants'

type DisableScrollState = {
  oldScrollY: number
}

export const useDisableScroll = () => {
  const [state, setState] = useState<DisableScrollState>({
    oldScrollY: 0,
  })

  const disableScroll = useCallback(() => {
    setState({ oldScrollY: parseFloat(getWindowPropertyValue(cssVars.scrollY)) })
    document.body.style.paddingRight = `var(${cssVars.scrollBarSize})`
    document.body.style.overflow = 'hidden'
    // Support for Safari
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.top = `var(${cssVars.scrollY})`
  }, [])

  const releaseScroll = useCallback(() => {
    document.body.style.position = ''
    document.body.style.width = ''
    document.body.style.top = ''
    document.body.style.paddingRight = ''
    document.body.style.overflow = ''
    window.scrollTo(0, state.oldScrollY)
    setState({ oldScrollY: 0 })
  }, [state])

  return { disableScroll, releaseScroll }
}
