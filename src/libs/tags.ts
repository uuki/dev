import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import slugify from 'slugify'
import { PostFrontMatter } from '@/types/Post'
import { getFiles } from './mdx'
import { root } from '@/utils/files'
import configManage from '@/config/manage'

export async function getAllTags() {
  const files = await getFiles()
  const tagCount: Record<string, number> = {}
  const dir = path.join(root, configManage.contents_path)

  files.forEach((file) => {
    const source = fs.readFileSync(path.join(dir, file), 'utf8')
    const data = matter(source).data as PostFrontMatter

    data.tags?.forEach((tag) => {
      const formattedTag = slugify(tag)
      tagCount[formattedTag] ??= 0
      tagCount[formattedTag]++
    })
  })

  return tagCount
}
