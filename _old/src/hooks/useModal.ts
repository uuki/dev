import React, { useCallback } from 'react'
import { useRecoilState } from 'recoil'
import { appState } from '@/recoil/atoms/app'

export const useModal = () => {
  const [app, setApp] = useRecoilState(appState)

  const showModal = useCallback(() => {
    setApp({
      ...app,
      showModal: true,
    })
  }, [app])

  const closeModal = useCallback(() => {
    setApp({
      ...app,
      showModal: false,
    })
  }, [app])

  const toggleModal = useCallback(() => {
    setApp({
      ...app,
      showModal: !app.showModal,
    })
  }, [app])
  return { isShow: app.showModal, showModal, closeModal, toggleModal }
}
