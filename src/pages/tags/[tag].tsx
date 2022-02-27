import { GetStaticPropsContext, InferGetStaticPropsType } from 'next'
import { useRouter } from 'next/router'
import slugify from 'slugify'
import MetaBasic from '@/components/functional/meta/MetaBasic'
import MetaOpenGraph from '@/components/functional/meta/MetaOpenGraph'
import { ArchiveLayout } from '@/layouts/ArchiveLayout'
import { getAllFiles } from '@/libs/mdx'
import { getAllTags } from '@/libs/tags'

export async function getStaticPaths() {
  const tags = await getAllTags()

  return {
    fallback: false,
    paths: Object.keys(tags).map((tag) => ({ params: { tag } })),
  }
}

export async function getStaticProps({ params }: GetStaticPropsContext<{ tag: string }>) {
  const allPosts = await getAllFiles()
  const filteredPosts = allPosts.filter((post) => post.tags.map((t) => slugify(t)).includes(params!.tag))

  return {
    props: {
      posts: filteredPosts,
      tag: params!.tag,
    },
  }
}

const POSTS_PER_PAGE = 2

type Props = InferGetStaticPropsType<typeof getStaticProps>

export default function Tag({ posts, tag }: Props) {
  const router = useRouter()
  const page = parseInt((router.query?.page as string) || '1')
  const initialDisplayPosts = posts.slice(POSTS_PER_PAGE * (page - 1), POSTS_PER_PAGE * page)
  const pagination = {
    currentPage: page,
    totalPages: Math.ceil(posts.length / POSTS_PER_PAGE),
  }
  return (
    <>
      <MetaBasic title={`${tag} - Tags`} description={''} />
      <MetaOpenGraph type="website" title={`${tag} Tags`} description={''} />
      <ArchiveLayout
        initialDisplayPosts={initialDisplayPosts}
        pagination={pagination}
        posts={posts}
        title={`#${tag} - Tags`}
      />
    </>
  )
}
