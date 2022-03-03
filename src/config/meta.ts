type MetaConfigProps = {
  readonly SITE_NAME: string
  readonly SITE_URL: string
  readonly SITE_DESCRIPTION: string
}

const config: MetaConfigProps = {
  SITE_NAME: process.env.NEXT_PUBLIC_META_SITE_NAME || '',
  SITE_URL: process.env.NEXT_PUBLIC_META_SITE_URL || '',
  SITE_DESCRIPTION: process.env.NEXT_PUBLIC_META_SITE_DESCRIPTION || '',
}

export default config
