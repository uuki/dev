import Head from 'next/head'
import config from '@/config/meta'

type BasicMetaProps = {
  title?: string
  description?: string
}

const MetaBasic = ({ title, description }: BasicMetaProps) => {
  return (
    <Head>
      <title>{title ? [title, config.SITE_NAME].join(' | ') : config.SITE_NAME}</title>
      <meta name="description" content={description ? description : config.SITE_DESCRIPTION} />
    </Head>
  )
}

export default MetaBasic
