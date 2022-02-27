import { Tags } from '@/types/Tag'

export type PostOriginName = 'zenn' | 'hatena' | 'qiita' | 'uuki'

export type PostOrigin = {
  name?: PostOriginName
  logo?: string
  url?: string
}

export type PostStaticFrontMatter = {
  title: string
  description: string
  author: string
  date: string
  lastmod?: string
  image: string
}

export type PostFrontMatter = {
  title: string
  slug: string
  description: string
  author: string
  date: string
  lastmod?: string
  draft: true
  tags: Tags
  image: string
  origin?: PostOriginName
  url?: string
}

export type PostRevision = {
  hash: string
  authorDate: string
}
