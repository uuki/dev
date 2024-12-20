import { ReactNode, useMemo } from 'react'
import { ComponentMap, getMDXComponent } from 'mdx-bundler/client'
import { Link } from '@/components/atoms/Link/Link'
import { Pre } from '@/components/atoms/Pre'
import { Note } from '@/components/atoms/Note'
import MDXImage from '@/components/functional/mdx/MDXImage'

type WrapperProps = {
  children?: ReactNode
  layout?: string
}

export const MDXComponents: ComponentMap = {
  a: ({ className, ...props }) => <Link {...props} className={className} />,
  // @ts-ignore
  img: MDXImage,
  Pre,
  wrapper: ({ layout = 'PostLayout', ...rest }: WrapperProps) => {
    const Layout = require(`@/layouts/${layout}`)[layout]
    return <Layout {...rest} />
  },
  Note,
}

type Props = {
  layout: string
  mdxSource: string
  [key: string]: unknown
}

export const MDXLayoutRenderer = ({ layout, mdxSource, ...rest }: Props) => {
  const MDXLayout = useMemo(() => getMDXComponent(mdxSource), [mdxSource])
  return <MDXLayout layout={layout} components={MDXComponents} {...rest} />
}
