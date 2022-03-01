import Head from 'next/head'
import { useRouter } from 'next/router'
import configMeta from '@/config/meta'

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
      {title && <meta property="og:title" content={[title, configMeta.site_name].join(' | ')} />}
      <meta property="og:description" content={description ? description : configMeta.site_description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={configMeta.site_name} />
      <meta property="og:url" content={`${configMeta.site_url}${router?.asPath}`} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:locale" content="ja_JP" />
      <meta property="twitter:card" content="summary_large_image" />
    </Head>
  )
}

export default MetaOpenGraph
