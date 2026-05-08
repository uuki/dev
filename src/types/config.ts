export type SocialType = 'x' | 'github';
export type ContactType = 'email';

interface BaseLink {
  url: string;
  handle: string;
  label: string;
}

export interface SocialLink extends BaseLink {
  type: SocialType;
}

export interface ContactLink extends BaseLink {
  type: ContactType;
}

export interface FeedsConfig {
  atom?: string;
  rss?: string;
}

export interface GitConfig {
  enabled: boolean;
  repoUrl?: string;
  showHistory?: boolean;
  maxCommits?: number;
}

export interface SiteConfig {
  lang: string;
  siteName: string;
  git?: GitConfig;
  social?: SocialLink[];
  contact?: ContactLink[];
  feeds?: FeedsConfig;
}
