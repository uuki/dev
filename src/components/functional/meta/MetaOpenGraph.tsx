import Head from 'next/head'
import { useRouter } from 'next/router'
import config from '@/config/meta'

type OpenGraphMetaProps = {
  // url: string
  type: 'website' | 'article'
  title?: string
  description?: string
  image?: string
}

const MetaOpenGraph = function ({ type, title, description, image }: OpenGraphMetaProps) {
  const router = useRouter()

  return (
    <Head>
      {title && <meta property="og:title" content={[title, config.SITE_NAME].join(' | ')} />}
      <meta property="og:description" content={description || config.SITE_DESCRIPTION} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={config.SITE_NAME} />
      <meta property="og:url" content={`${config.SITE_URL}${router?.asPath}`} />
      <meta property="og:image" content={image || `${config.SITE_URL}/static/images/site-image.png`} />
      <meta property="og:locale" content="ja_JP" />
      <meta property="twitter:card" content="summary_large_image" />
    </Head>
  )
}

export default MetaOpenGraph
