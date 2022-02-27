import React, { ReactNode, useRef, useState } from 'react'
import { FiCheck, FiCopy } from 'react-icons/fi'

export type PreProps = {
  children?: ReactNode
}

const Pre = ({ children }: PreProps) => {
  const textInput = useRef<HTMLDivElement>(null!)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    setCopied(true)
    navigator.clipboard.writeText(textInput.current.textContent ?? '')
    setTimeout(() => setCopied(false), 2000)
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
