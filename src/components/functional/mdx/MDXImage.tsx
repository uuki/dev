import Image from 'next/image'
import React, { memo, useCallback, useState, useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { browserState } from '@/recoil/atoms/app'
import { useModal } from '@/hooks/useModal'
import ModalContent from '@/components/functional/modal/ModalContent'
import { compare } from 'compare-versions'
// import config from '@/config/manage'

export type MDXImageProps = {
  src?: string
  alt?: string
}

const ImageSnippet = (props: MDXImageProps) => {
  return (
    <span className="image-container shadow-media">
      <Image src={require(`/public/${props.src?.replace(/^\//, '')}`)} alt={props.alt} className="rounded-md" />
    </span>
  )
}

const MDXImage = (props: MDXImageProps) => {
  const browser = useRecoilValue(browserState)
  const { isShow, toggleModal } = useModal()
  const [currentSource, setCurrentSource] = useState<string>('')

  useEffect(() => {
    if (!isShow && currentSource) {
      setCurrentSource('')
    }
  }, [isShow, currentSource])

  const handleToggle = useCallback(
    (src?: string) => {
      if (!src) {
        return
      }
      setCurrentSource(src)
      toggleModal()
    },
    [toggleModal]
  )

  if (browser && /Safari/i.test(browser.browser.name || '')) {
    const notSupportDialog = compare(browser.browser.version || '', '15.4', '<')
    if (notSupportDialog) {
      return <ImageSnippet {...props} />
    }
  }

  if (isShow && currentSource === props.src) {
    return (
      <ModalContent>
        <ImageSnippet {...props} />
      </ModalContent>
    )
  }

  return (
    <button type="button" onClick={() => handleToggle(props.src)}>
      <ImageSnippet {...props} />
    </button>
  )
}

export default memo(MDXImage)
