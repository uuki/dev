import type { PostFrontMatter } from '#/post'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { bundleMDX } from 'mdx-bundler'
import readingTime, { ReadTimeResults } from 'reading-time'
import Prism from 'prismjs';
import { differenceInYears, parseISO } from 'date-fns'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import externalLinks from 'remark-external-links'
import rehypeSlug from 'rehype-slug'
import rehypeKatex from 'rehype-katex'
import rehypeCitation from 'rehype-citation'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrismPlus from 'rehype-prism-plus'
// import rehypeLabelPlugin from '@/plugins/rehypeLabel';
import { s } from 'hastscript'
import { AiOutlineLink } from 'react-icons/ai'
import { root } from '@/utils/files'
import { nonBoolean } from '@/utils/typeGuard'
import config from '@/config/manage'

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
  pages: config.PAGES_PATH,
  blog: config.CONTENTS_PATH,
}

export function getFiles() {
  const contentsPath = path.join(root, config.CONTENTS_PATH)
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

export function safeDateString(date: string | Date): string {
  const d = date instanceof Date ? date : new Date(date)
  return d.toISOString()
}

export async function getFileBySlug<T extends 'pages' | 'blog'>(type: T, slug: string) {
  const file = path.join(root, pathPattern[type], slug)
  if (/\.DS_Store$/.test(file)) {
    return
  }
  const filePath = fs.existsSync(`${file}.mdx`) ? `${file}.mdx` : `${file}.md`
  const source = fs.readFileSync(filePath, 'utf8')

  const { code, frontmatter }: { code: string; frontmatter: PostFrontMatter } = await bundleMDX({
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
        // [rehypeLabelPlugin],
        [rehypePrismPlus, { ignoreMissing: true }],
        [rehypeKatex, { throwOnError: true, strict: true }],
        [rehypeCitation, { path: path.join(root, 'data') }],
      ]

      return options
    },
  })

  const postDate: Date = new Date(frontmatter.date);
  const currentDate = new Date();
  const isLegacy = differenceInYears(currentDate, postDate) > 5;
  let updatedCode = code;

  if (isLegacy) {
  }

  const data: {
    frontMatter: PostFrontMatter & {
      date: string
      fileName: string
      readingTime: ReadTimeResults
      slug: string
    }
    mdxSource: string
  } = {
    frontMatter: {
      ...frontmatter,
      date: frontmatter.date ? safeDateString(frontmatter.date) : '',
      fileName: path.basename(filePath),
      readingTime: readingTime(updatedCode),
      slug: slug || path.basename(filePath),
    },
    mdxSource: updatedCode,
  }
  return data
}

export async function getAllFiles() {
  const dir = path.join(root, config.CONTENTS_PATH)
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
        date: safeDateString(frontMatter.date),
        slug: formatSlug(fileName),
      }
    })
    .filter(nonBoolean)

  return posts.sort((a, b) => dateSortDesc(a.date, b.date))
}
