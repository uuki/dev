import { ReactNode } from 'react'

interface PageHeaderProps {
  children?: ReactNode
}

const PageHeader = ({ children }: PageHeaderProps) => {
  return <h1 className="md:text-[2.25rem] sm:text-[1.75rem] leading-[1.6] tracking-[0.04em] font-bold">{children}</h1>
}

export { PageHeader }
