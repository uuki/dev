import { InferGetStaticPropsType, GetStaticPropsContext, GetStaticPathsContext } from 'next'
import { MDXLayoutRenderer } from '@/components/functional/mdx/MDXComponents'
import MetaBasic from '@/components/functional/meta/MetaBasic'
import MetaOpenGraph from '@/components/functional/meta/MetaOpenGraph'
import { getFiles, formatSlug, getAllFiles, getFileBySlug } from '@/libs/mdx'
import { getFileRevision } from '@/libs/git'
import generateRss from '@/utils/generateRss'
import config from '@/config/meta'

export async function getStaticPaths(context: GetStaticPathsContext) {
  const posts = await getFiles()
  return {
    fallback: false,
    paths: posts.map((fileName) => ({
      params: {
        slug: formatSlug(fileName),
      },
    })),
  }
}

export async function getStaticProps({ params }: GetStaticPropsContext<{ slug: string }>) {
  const slug = params!.slug
  const posts = await getAllFiles()
  const postIndex = posts.findIndex((post) => post.slug === slug)
  const post = await getFileBySlug('blog', slug)
  const history = await getFileRevision({ slug })

  // RSS
  if (posts.length > 0) {
    generateRss(posts)
  }

  return {
    props: {
      post: JSON.parse(JSON.stringify(post)),
      history,
    },
  }
}

type Props = InferGetStaticPropsType<typeof getStaticProps>

const Post = ({ post, history }: Props) => {
  const { frontMatter, mdxSource } = post

  return (
    <>
      <MetaBasic title={frontMatter.title} description={frontMatter.description} />
      <MetaOpenGraph
        type="article"
        title={frontMatter.title}
        description={frontMatter.description}
        image={`${config.SITE_URL}/api/image?title=${encodeURIComponent(`${frontMatter.title}`)}`}
      />
      <MDXLayoutRenderer layout="PostLayout" frontMatter={frontMatter} mdxSource={mdxSource} history={history} />
    </>
  )
}

export default Post
