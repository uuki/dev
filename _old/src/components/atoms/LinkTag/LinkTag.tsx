import slugify from 'slugify'
import { Link } from '@/components/atoms/Link'

export type LinkTagProps = {
  children: string
}

const LinkTag = ({ children }: LinkTagProps) => {
  return (
    <Link href={`/tags/${slugify(children)}`} className="font-[600] text-link-400 link-opacity">
      {children}
    </Link>
  )
}

export { LinkTag }
