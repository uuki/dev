import fs from 'fs'
import { join } from 'path'
import { Feed } from 'feed'
import meta from '@/config/meta'
import manage from '@/config/manage'
import { escape } from '@/utils/htmlEscaper'
import { PostFrontMatter } from '@/types/Post'

export const generateRss = (posts: PostFrontMatter[]) => {
  const feed = new Feed({
    title: escape(meta.SITE_NAME),
    description: escape(meta.SITE_DESCRIPTION),
    id: meta.SITE_URL,
    link: meta.SITE_URL,
    language: 'ja',
    image: `${meta.SITE_URL}/static/icon/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, uuki.dev`,
    // ...(posts[0].lastmod && { updated: `${new Date(posts[0].lastmod)}`}),
    feedLinks: {
      rss2: `${meta.SITE_URL}/feed.xml`,
      json: `${meta.SITE_URL}/feed.json`,
      atom: `${meta.SITE_URL}/atom.xml`,
    },
    author: {
      name: 'uuki',
      email: manage.EMAIL,
    },
  })

  posts.forEach((post) => {
    feed.addItem({
      guid: join(meta.SITE_URL, manage.CONTENTS_PATH, post.slug),
      title: `${escape(post.title)}`,
      ...(post.description && { description: escape(post.description) }),
      link: join(meta.SITE_URL, manage.CONTENTS_PATH, post.slug),
      content: '',
      date: new Date(post.date),
    })
  })

  fs.writeFileSync('./public/feed.xml', feed.rss2())
  fs.writeFileSync('./public/atom.xml', feed.atom1())
  fs.writeFileSync('./public/feed.json', feed.json1())
}

export default generateRss
