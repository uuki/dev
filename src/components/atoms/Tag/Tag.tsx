import { HTMLAttributes } from 'react'

export type SpanProps = HTMLAttributes<HTMLSpanElement>

const Tag = ({ children, ...rest }: SpanProps) => {
  return (
    <span className="inline-block px-[6px] text-[0.75rem] font-bold bg-navy-600 text-white rounded-[4px]">
      {children}
    </span>
  )
}

export { Tag }
