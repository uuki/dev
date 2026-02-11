const { format, parseISO } = require('date-fns')

const EXCLUDES = /^\/(tags\/.*)/

const isIgnorePath = path => {
  return EXCLUDES.test(path)
}

const getLastmodByPath = path => {
  const data = require(`./.next/server/pages${path.replace(/^\/$/, '/index')}.json`)
  const props = data.pageProps.page || data.pageProps.post
  const frontMatter = props ? props.frontMatter : false
  const lastMod = frontMatter ? parseISO(frontMatter.lastmod) : new Date()

  return format(lastMod, 'yyyy-MM-dd')
}

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_META_SITE_URL,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  outDir: './public',
  transform: (config, path) => {
    if (isIgnorePath(path)) {
      return null
    }
    return {
      loc: path,
      lastmod: getLastmodByPath(path)
    }
  }
}
