export interface GitConfig {
  enabled: boolean;
  repoUrl?: string;
  showHistory?: boolean;
  maxCommits?: number;
}

export interface SocialConfig {
  email?: string;
  twitter?: string;
  github?: string;
}

export interface SiteConfig {
  lang: string;
  siteName: string;
  git?: GitConfig;
  social?: SocialConfig;
}
