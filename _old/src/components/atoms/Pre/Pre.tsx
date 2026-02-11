import React, { ReactElement, useRef, useState, useEffect } from 'react'
import { FiCheck, FiCopy } from 'react-icons/fi'
import { TwitterTweetEmbed } from 'react-twitter-embed'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import Codepen from 'react-codepen-embed'

// import Prism from 'prismjs'
// import 'prismjs/components/prism-markup-templating';
// import 'prismjs/components/prism-php.min.js'
// import 'prismjs/components/prism-shell.min.js'
// import 'prismjs/components/prism-yaml.min.js'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

export type PreProps = {
  embed?: 'twitter' | 'youtube' | 'codepen'
  label?: string
  children: ReactElement
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

const Pre = ({ label, embed, children }: PreProps) => {
  const textInput = useRef<HTMLDivElement>(null!)
  const [copied, setCopied] = useState(false)
  const classNames = (children?.props.className || '').split(' ')
  const id: any = textContent(children).replace(/\r\n|\n|\r/g, '')

  const handleCopy = () => {
    setCopied(true)
    navigator.clipboard.writeText(textInput.current.textContent ?? '')
    setTimeout(() => setCopied(false), 2000)
  }

  if (embed === 'twitter' && id) {
    return (
      <div className="my-[30px] first:mt-0 last:mb-0">
        <TwitterTweetEmbed tweetId={id} options={{ conversation: 'none', align: 'center' }} />
      </div>
    )
  }

  if (embed === 'youtube' && id) {
    return <LiteYouTubeEmbed id={id} title="youtube" />
  }

  if (embed === 'codepen' && id) {
    return <Codepen hash={id} height={400} user="uuki" />
  }

  return (
    <div className={['codeblock', 'group', 'relative'].join(' ')}>
      {label && (
        <span className="absolute top-0 left-0 px-2 py-1 text-[0.875rem] font-bold leading-[1.2] text-white bg-[#5b5b5b] rounded-br-lg">
          {label}
        </span>
      )}
      <button
        aria-label="Copy code"
        className={`absolute right-2 top-2 flex items-center justify-center h-8 w-8 rounded bg-white opacity-0 group-hover:opacity-100 text-green-100`}
        onClick={handleCopy}
        type="button"
      >
        {copied ? <FiCheck /> : <FiCopy />}
      </button>
      <div ref={textInput}>
        {children}
      </div>
    </div>
  )
}

export { Pre }
