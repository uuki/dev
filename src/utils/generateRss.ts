// import configMeta from '@/config/meta'
// import { escape } from '@/utils/htmlEscaper'
// import { PostFrontMatter } from '@/types/Post'

// const generateRssItem = (post: PostFrontMatter) => `
//   <item>
//     <guid>${configMeta.site_url}/blog/${post.slug}</guid>
//     <title>${escape(post.title)}</title>
//     <link>${configMeta.site_url}/blog/${post.slug}</link>
//     ${post.summary && `<description>${escape(post.summary)}</description>`}
//     <pubDate>${new Date(post.date).toUTCString()}</pubDate>
//     <author>${configMeta.email} (uuki)</author>
//     ${post.tags && post.tags.map((t) => `<category>${t}</category>`).join('')}
//   </item>
// `

// const generateRss = (posts: PostFrontMatter[], page = 'feed.xml') => `
//   <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
//     <channel>
//       <title>${escape(configMeta.title)}</title>
//       <link>${configMeta.siteUrl}/blog</link>
//       <description>${escape(configMeta.description)}</description>
//       <language>${configMeta.language}</language>
//       <managingEditor>${configMeta.email} (uuki)</managingEditor>
//       <webMaster>${configMeta.email} (uuki)</webMaster>
//       <lastBuildDate>${new Date(posts[0].date).toUTCString()}</lastBuildDate>
//       <atom:link href="${configMeta.siteUrl}/${page}" rel="self" type="application/rss+xml"/>
//       ${posts.map(generateRssItem).join('')}
//     </channel>
//   </rss>
// `

// export default generateRss

import fs from 'fs'
import { join } from 'path'
import { Feed } from 'feed'
import configMeta from '@/config/meta'
import configManage from '@/config/manage'
import { escape } from '@/utils/htmlEscaper'
import { PostFrontMatter } from '@/types/Post'

export const generateRss = (posts: PostFrontMatter[]) => {
  const feed = new Feed({
    title: escape(configMeta.site_name),
    description: escape(configMeta.site_description),
    id: configMeta.site_url,
    link: configMeta.site_url,
    language: 'ja',
    image: `${configMeta.site_url}/static/icon/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, uuki.dev`,
    // ...(posts[0].lastmod && { updated: `${new Date(posts[0].lastmod)}`}),
    feedLinks: {
      rss2: `${configMeta.site_url}/feed.xml`,
      json: `${configMeta.site_url}/feed.json`,
      atom: `${configMeta.site_url}/atom.xml`,
    },
    author: {
      name: 'uuki',
      email: configManage.email,
    },
  })

  posts.forEach((post) => {
    feed.addItem({
      guid: join(configMeta.site_url, configManage.contents_path, post.slug),
      title: `${escape(post.title)}`,
      ...(post.description && { description: escape(post.description) }),
      link: join(configMeta.site_url, configManage.contents_path, post.slug),
      content: '',
      date: new Date(post.date),
    })
  })

  fs.writeFileSync('./public/feed.xml', feed.rss2())
  fs.writeFileSync('./public/atom.xml', feed.atom1())
  fs.writeFileSync('./public/feed.json', feed.json1())
}

export default generateRss
