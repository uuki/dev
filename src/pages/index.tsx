import { useState } from 'react'
import { InferGetStaticPropsType, GetStaticPropsContext } from 'next'
import { Link } from '@/components/atoms/Link'
import MetaBasic from '@/components/functional/meta/MetaBasic'
import MetaOpenGraph from '@/components/functional/meta/MetaOpenGraph'
import { ContainerLayout } from '@/layouts/ContainerLayout/ContainerLayout'
import { Hero } from '@/components/molecules/Hero'
import { Card } from '@/components/molecules/Card'
import { ScrollContainer } from '@/components/organisms/ScrollContainer'
import { getAllFiles } from '@/libs/mdx'
import { sliceIntoChunks } from '@/utils/array'
import { PostFrontMatter } from '@/types/Post'
import { HiArrowNarrowRight } from 'react-icons/hi'

type Props = InferGetStaticPropsType<typeof getStaticProps>

export async function getStaticProps(context: GetStaticPropsContext) {
  const posts = await getAllFiles()
  return {
    props: {
      posts: JSON.parse(JSON.stringify(posts)),
    },
  }
}

export default function Home({ posts }: Props) {
  const perPage = 5
  const postChunk: PostFrontMatter[][] = sliceIntoChunks(posts, perPage)
  const [hasMore, setHasMore] = useState(true)
  const [list, setList] = useState<PostFrontMatter[]>(postChunk[0])
  const loadMore = (page: number) => {
    if (page > postChunk.length - 1) {
      setHasMore(false)
    } else {
      setList([...postChunk.slice(0, page).flat()])
    }
  }

  const items = (
    <ul className="mb-[75]">
      {list.map((prop, i) => (
        <li key={prop.slug + i} className="mt-[30px]">
          <Card {...prop} />
        </li>
      ))}
    </ul>
  )

  return (
    <>
      <MetaBasic />
      <MetaOpenGraph type="website" />

      <ContainerLayout>
        <div className="md:py-[75px] sm:py-[34px]">
          <div className="flex justify-center md:mb-20 sm:mb-10">
            <Hero />
          </div>
          <div className="px-content-narrow">
            <div className="mb-[75]">
              <ScrollContainer pageStart={1} loadMore={loadMore} items={items} hasMore={hasMore} />
            </div>
            <div className="flex justify-end md:mt-[75px] sm:mt-[36px]">
              <Link href="/blog/" className="flex items-center text-[0.875rem]">
                <span className="link-in-out">記事一覧へ</span>
                <HiArrowNarrowRight className="ml-[3px]" />
              </Link>
            </div>
          </div>
        </div>
      </ContainerLayout>
    </>
  )
}
