import React from 'react'
import { createPortal } from 'react-dom'
import { portalSelector } from '@/constants'
import style from './ModalContent.module.css'

const ModalContent = ({ children }: { children: JSX.Element }) => {
  const target = document.querySelector(portalSelector)

  if (!target) {
    return <div>[Error] Portal target not found.</div>
  }

  return createPortal(
    <div className={style.modalContent}>
      <button type="button" className={style.closeButton}></button>
      <div className={style.content}>{children}</div>
    </div>,
    target
  )
}

export default ModalContent
