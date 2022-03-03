import { InferGetStaticPropsType, GetStaticPropsContext } from 'next'
import { MDXLayoutRenderer } from '@/components/functional/mdx/MDXComponents'
import MetaBasic from '@/components/functional/meta/MetaBasic'
import MetaOpenGraph from '@/components/functional/meta/MetaOpenGraph'
import { getFileBySlug } from '@/libs/mdx'

export async function getStaticProps(context: GetStaticPropsContext) {
  const page = await getFileBySlug('pages', 'about')
  return { props: { page: JSON.parse(JSON.stringify(page)) } }
}

type Props = InferGetStaticPropsType<typeof getStaticProps>

export default function About({ page }: Props) {
  const { frontMatter, mdxSource } = page!

  return (
    <div>
      <MetaBasic title="About" />
      <MetaOpenGraph type="website" />
      <MDXLayoutRenderer frontMatter={frontMatter} layout="AboutLayout" mdxSource={mdxSource} />
    </div>
  )
}
