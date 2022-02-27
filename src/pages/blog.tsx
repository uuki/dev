import { InferGetStaticPropsType, GetStaticPropsContext } from 'next'
import { useRouter } from 'next/router'
import MetaBasic from '@/components/functional/meta/MetaBasic'
import MetaOpenGraph from '@/components/functional/meta/MetaOpenGraph'
import { ArchiveLayout } from '@/layouts/ArchiveLayout'
import { getAllFiles } from '@/libs/mdx'

export const POSTS_PER_PAGE = 2

export async function getStaticProps(context: GetStaticPropsContext) {
  const posts = await getAllFiles()
  return { props: { posts } }
}

type Props = InferGetStaticPropsType<typeof getStaticProps>

export default function Blog({ posts }: Props) {
  const router = useRouter()
  const page = parseInt((router.query?.page as string) || '1')
  const initialDisplayPosts = posts.slice(POSTS_PER_PAGE * (page - 1), POSTS_PER_PAGE * page)
  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }

  return (
    <>
      <MetaBasic title={'All Posts'} />
      <MetaOpenGraph type="website" />

      <ArchiveLayout
        title="All Posts"
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        posts={posts}
      />
    </>
  )
}
