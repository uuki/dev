import config from '@root/site.config.yml'

type MetaConfigProps = {
  readonly site_name: string
  readonly site_url: string
  readonly site_description: string
  readonly twitter_account: string
  readonly github_account: string
}

export default config.meta as MetaConfigProps
