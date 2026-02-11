import { InferGetStaticPropsType } from 'next'
import MetaBasic from '@/components/functional/meta/MetaBasic'
import MetaOpenGraph from '@/components/functional/meta/MetaOpenGraph'
import { TagsLayout } from '@/layouts/TagsLayout'
import { getAllTags } from '@/libs/tags'

export async function getStaticProps() {
  const tags = await getAllTags()
  return { props: { tags } }
}

export default function Tags({ tags }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <MetaBasic title={'Tags'} />
      <MetaOpenGraph type="website" title={'Tags'} />
      <TagsLayout tags={tags} />
    </>
  )
}
