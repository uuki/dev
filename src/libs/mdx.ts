import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { bundleMDX } from 'mdx-bundler'
import readingTime from 'reading-time'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import externalLinks from 'remark-external-links'
import rehypeSlug from 'rehype-slug'
import rehypeKatex from 'rehype-katex'
import rehypeCitation from 'rehype-citation'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrismPlus from 'rehype-prism-plus'
import { s } from 'hastscript'
import { AiOutlineLink } from 'react-icons/ai'
import { root } from '@/utils/files'
import { nonBoolean } from '@/utils/typeGuard'
import { PostFrontMatter } from '@/types/Post'
import configManage from '@/config/manage'

const jsxIconLink = AiOutlineLink({})
const icon = s(
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 20,
    height: 20,
    fill: 'black',
    viewBox: jsxIconLink.props.attr.viewBox,
    class: 'inline',
  },
  s('path', {
    d: jsxIconLink.props.children[0].props.d,
  })
)

const pathPattern = {
  pages: configManage.pages_path,
  blog: configManage.contents_path,
}

export function getFiles() {
  const contentsPath = path.join(root, configManage.contents_path)
  return fs.promises.readdir(contentsPath)
}

export function formatSlug(slug: string) {
  return slug.replace(/\.mdx$/, '')
}

export function dateSortDesc(a: string, b: string) {
  if (a > b) return -1
  if (a < b) return 1
  return 0
}

export async function getFileBySlug<T extends 'pages' | 'blog'>(type: T, slug: string) {
  const file = path.join(root, pathPattern[type], slug)
  const filePath = fs.existsSync(`${file}.mdx`) ? `${file}.mdx` : `${file}.md`
  const source = fs.readFileSync(filePath, 'utf8')

  const { code, frontmatter } = await bundleMDX({
    cwd: path.join(root, 'components'),
    source,
    xdmOptions(options) {
      options.remarkPlugins = [
        ...(options.remarkPlugins ?? []),
        remarkGfm,
        remarkMath,
        [externalLinks, { target: '_blank' }],
      ]
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: 'prepend',
            properties: {
              ariaHidden: true,
              class: 'rehype-heading',
              tabIndex: -1,
            },
            content: icon,
          },
        ],
        [rehypePrismPlus, { ignoreMissing: true }],
        [rehypeKatex, { throwOnError: true, strict: true }],
        [rehypeCitation, { path: path.join(root, 'data') }],
      ]

      return options
    },
  })

  return {
    frontMatter: {
      ...frontmatter,
      date: frontmatter.date ? new Date(frontmatter.date).toISOString() : null,
      fileName: path.basename(filePath),
      readingTime: readingTime(code),
      slug: slug || path.basename(filePath),
    },
    mdxSource: code,
  }
}

export async function getAllFiles() {
  const dir = path.join(root, configManage.contents_path)
  const files = fs.readdirSync(dir).map((file) => path.join(dir, file))
  const posts: PostFrontMatter[] = files
    .map((file) => {
      if (!/\.mdx$/.test(file)) {
        return false
      }
      const fileName = path.basename(file)
      const source = fs.readFileSync(file, 'utf-8')
      const frontMatter = matter(source).data as PostFrontMatter

      return {
        ...frontMatter,
        date: new Date(frontMatter.date).toISOString(),
        slug: formatSlug(fileName),
      }
    })
    .filter(nonBoolean)

  return posts.sort((a, b) => dateSortDesc(a.date, b.date))
}
