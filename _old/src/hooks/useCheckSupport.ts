import type { IBrowser } from 'ua-parser-js'
import React, { useCallback } from 'react'
import { useRecoilValue } from 'recoil'
import { browserState } from '@/recoil/atoms/app'
import { compare, validate } from 'compare-versions'

export type CheckSupportEntry = {
  browser: RegExp
  supported: NonNullable<IBrowser['version']>
}

export const useCheckSupport = () => {
  const browser = useRecoilValue(browserState)

  const checkUnSupportByVersion = useCallback(
    (checkList: CheckSupportEntry[]): boolean => {
      if (!browser) {
        return false
      }
      let matched = false

      for (const entry of checkList) {
        const isValidFormat = validate(browser.browser?.version || '')
        const isTarget = entry.browser.test(browser.browser.name || '')

        if (isValidFormat && isTarget) {
          try {
            matched = compare(browser.browser.version!, entry.supported, '<')
          } catch (err) {
            console.warn(err)
          }
        }
        if (matched) break
      }

      return matched
    },
    [browser]
  )

  return {
    checkUnSupportByVersion,
  }
}
