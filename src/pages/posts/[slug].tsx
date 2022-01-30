import type { GetStaticProps, GetStaticPaths } from 'next'
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import fs from 'fs'
import yaml from 'js-yaml'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import config from '@/config/site'

import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import externalLinks from 'remark-external-links'
// TODO: @mapbox/rehype-prism does not have typescript definition
// @ts-ignore
import rehypePrism from '@mapbox/rehype-prism'

import { fetchPostContent } from '@/libs/posts'

type MDXProps = {
  source: MDXRemoteSerializeResult
  meta: {
    [key: string]: any
  }
}

const CustomComponent = () => <div></div>
const components = { Link, Image, CustomComponent }

const Post = ({ meta, source }: MDXProps) => {
  return (
    <>
      <Head>
        <title>
          {meta.title} - {config.site_name}
        </title>
      </Head>

      <div>
        <MDXRemote {...source} components={components}></MDXRemote>
      </div>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = fs.readdirSync(path.join(process.cwd(), 'docs'))
  const paths = files.map((filename) => ({
    params: {
      slug: filename.replace('.mdx', ''),
    },
  }))
  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<MDXProps, { slug: string }> = async ({ params }) => {
  if (!params?.slug) throw new Error('slug is missing')

  const filePath = path.join(process.cwd(), 'docs', `${params?.slug}.mdx`)
  const source = fs.readFileSync(filePath, 'utf-8')
  const { data: frontMatter, content } = matter(source, {
    engines: { yaml: (s) => yaml.load(s, { schema: yaml.JSON_SCHEMA }) as object },
  })
  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkMath, [externalLinks, { target: '_blank' }]],
      rehypePlugins: [rehypePrism, rehypeKatex],
    },
  })

  console.log(frontMatter)

  return {
    props: {
      meta: {
        ...frontMatter,
        slug: params.slug,
      },
      source: mdxSource,
    },
  }
}

export default Post
