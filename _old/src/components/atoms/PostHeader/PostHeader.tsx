import { ReactNode } from 'react'

interface PostHeaderProps {
  children?: ReactNode
}

const PostHeader = ({ children }: PostHeaderProps) => {
  return <h1 className="md:text-[1.75rem] sm:text-[1.375rem] leading-[1.6] tracking-[0.04em] font-bold">{children}</h1>
}

export { PostHeader }
