/**
 * Configuration Types
 * Type definitions for config.yml
 */

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
}
