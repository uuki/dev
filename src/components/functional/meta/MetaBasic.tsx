import Head from 'next/head'
import configMeta from '@/config/meta'

type BasicMetaProps = {
  title?: string
  description?: string
}

const MetaBasic = ({ title, description }: BasicMetaProps) => {
  return (
    <Head>
      <title>{title ? [title, configMeta.site_name].join(' | ') : configMeta.site_name}</title>
      <meta name="description" content={description ? description : configMeta.site_description} />
    </Head>
  )
}

export default MetaBasic
