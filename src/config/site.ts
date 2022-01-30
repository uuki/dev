import config from '@root/config.json'

type SiteConfigProps = {
  readonly site_name: string
  readonly base_url: string
  readonly site_title: string
  readonly site_description: string
  readonly twitter_account: string
  readonly github_account: string
}

export default config as SiteConfigProps
