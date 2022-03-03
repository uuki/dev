type ManageConfigProps = {
  readonly PAGES_PATH: string
  readonly CONTENTS_PATH: string
  readonly MEDIA_PATH: string
  readonly GOOGLE_ANALYTICS_ID: string
  readonly GITHUB_REP_URL: string
  readonly EMAIL: string
  readonly TWITTER: string
  readonly GITHUB: string
}

const config: ManageConfigProps = {
  PAGES_PATH: process.env.NEXT_PUBLIC_MANAGE_PAGES_PATH || 'data/pages',
  CONTENTS_PATH: process.env.NEXT_PUBLIC_MANAGE_CONTENTS_PATH || 'data/docs',
  MEDIA_PATH: process.env.NEXT_PUBLIC_MANAGE_MEDIA_PATH || 'data/images',
  GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_MANAGE_GOOGLE_ANALYTICS_ID || '',
  GITHUB_REP_URL: process.env.NEXT_PUBLIC_MANAGE_GITHUB_REP_URL || '',
  EMAIL: process.env.NEXT_PUBLIC_MANAGE_EMAIL || '',
  TWITTER: process.env.NEXT_PUBLIC_MANAGE_TWITTER || '',
  GITHUB: process.env.NEXT_PUBLIC_MANAGE_GITHUB || '',
}

export default config
