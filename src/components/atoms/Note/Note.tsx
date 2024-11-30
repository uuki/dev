import React, { ReactElement, useRef, useState } from 'react'

export type NoteProps = {
  type: 'info' | 'warn'
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

const Note = ({ type, children }: NoteProps) => {
  const typeStyles: { [key: string]: string } = {
    info: 'bg-blue-100 border-l-4 border-blue-500 text-blue-700',
    warn: 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700',
  };

  return (
    <div className={`p-4 rounded shadow-sm ${typeStyles[type]}`}>
      <div className="flex items-start">
        <span className="mr-[24px] font-bold">
          {type === 'info' && 'ℹ️'}
          {type === 'warn' && '⚠️'}
        </span>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );

}

export { Note }
