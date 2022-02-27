import config from '@root/site.config.yml'

type ManageConfigProps = {
  readonly pages_path: string
  readonly contents_path: string
  readonly media_path: string
  readonly google_analytics_id: string
  readonly github_rep_url: string
  readonly email: string
  readonly twitter: string
  readonly github: string
}

export default config.manage as ManageConfigProps
