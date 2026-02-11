import Image from 'next/image'
import React, { memo, useCallback, useState, useEffect } from 'react'
import { useModal } from '@/hooks/useModal'
import { useCheckSupport } from '@/hooks/useCheckSupport'
import ModalContent from '@/components/functional/modal/ModalContent'
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
  const checkBrowser = new RegExp(/Safari/, 'i')
  const { checkUnSupportByVersion } = useCheckSupport()
  const { isShow, toggleModal } = useModal()
  const [currentSource, setCurrentSource] = useState<string>('')
  const isUnSupportDialog = checkUnSupportByVersion([
    {
      browser: checkBrowser,
      supported: '15.4',
    },
  ])

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

  if (isUnSupportDialog) {
    return <ImageSnippet {...props} />
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
