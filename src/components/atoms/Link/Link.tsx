import NextLink from 'next/link'
import { AnchorHTMLAttributes } from 'react'

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement>

const Link = ({ href = '#', ...rest }: LinkProps) => {
  const isInternalLink = href.startsWith('/')
  const isAnchorLink = href.startsWith('#')

  return isInternalLink ? (
    <NextLink href={href}>
      <a {...rest} />
    </NextLink>
  ) : isAnchorLink ? (
    <a href={href} {...rest} />
  ) : (
    <a href={href} rel="noopener noreferrer" target="_blank" {...rest} />
  )
}

export { Link }
