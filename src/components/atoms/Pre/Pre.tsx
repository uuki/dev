import React, { ReactElement, useRef, useState } from 'react'
import { FiCheck, FiCopy } from 'react-icons/fi'
import { TwitterTweetEmbed } from 'react-twitter-embed'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import Codepen from 'react-codepen-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

export type PreProps = {
  children?: ReactElement
}

const textContent = (elem: React.ReactElement | string): string => {
  if (!elem) {
    return ''
  }
  if (typeof elem === 'string') {
    return elem
  }
  const children = elem.props && elem.props.children
  if (children instanceof Array) {
    return children.map(textContent).join('')
  }
  return textContent(children)
}

const Pre = ({ children }: any) => {
  const textInput = useRef<HTMLDivElement>(null!)
  const [copied, setCopied] = useState(false)
  const classNames = (children?.props.className || '').split(' ')
  const id: any = textContent(children).replace(/\r\n|\n|\r/g, '')

  const handleCopy = () => {
    setCopied(true)
    navigator.clipboard.writeText(textInput.current.textContent ?? '')
    setTimeout(() => setCopied(false), 2000)
  }

  if (classNames.includes('language-twitter') && id) {
    return (
      <div className="my-[30px] first:mt-0 last:mb-0">
        <TwitterTweetEmbed tweetId={id} options={{ conversation: 'none', align: 'center' }} />
      </div>
    )
  }

  if (classNames.includes('language-youtube') && id) {
    return <LiteYouTubeEmbed id={id} title="youtube" />
  }

  if (classNames.includes('language-codepen') && id) {
    return <Codepen hash={id} height={400} user="uuki" />
  }

  return (
    <div ref={textInput} className="group relative">
      <button
        aria-label="Copy code"
        className={`absolute right-2 top-2 flex items-center justify-center h-8 w-8 rounded bg-white opacity-0 group-hover:opacity-100 text-green-100`}
        onClick={handleCopy}
        type="button"
      >
        {copied ? <FiCheck /> : <FiCopy />}
      </button>

      <pre>{children}</pre>
    </div>
  )
}

export { Pre }
