import React, { useRef, useEffect, useCallback } from 'react'
import clsx from 'clsx'
import { useRecoilValue } from 'recoil'
import { appState } from '@/recoil/atoms/app'
import { useModal } from '@/hooks/useModal'
import { useDisableScroll } from '@/hooks/useDisableScroll'
import { portalSelector } from '@/constants'

import style from './Modal.module.css'

const Modal = () => {
  const app = useRecoilValue(appState)
  const { closeModal } = useModal()
  const { disableScroll, releaseScroll } = useDisableScroll()
  const ref: React.MutableRefObject<HTMLDialogElement | null> = useRef(null)

  useEffect(() => {
    if (!ref.current) {
      return
    }
    if (app.showModal) {
      try {
        ;(ref.current as any).showModal()
      } catch (err) {
        console.warn(err)
      }
      disableScroll()
    } else {
      try {
        ;(ref.current as any).close()
      } catch (err) {
        console.warn(err)
      }
      releaseScroll()
    }
  }, [app.showModal, disableScroll, releaseScroll])

  const handleClickDialog = useCallback(
    () => (event: React.MouseEvent<HTMLDialogElement>) => {
      if (!ref.current || !app.showModal) {
        return
      }
      closeModal()
    },
    [app.showModal, ref, closeModal]
  )

  return (
    <dialog
      ref={ref}
      className={clsx([portalSelector.replace('.', ''), style.modal])}
      onClick={handleClickDialog()}
    ></dialog>
  )
}

export default Modal
