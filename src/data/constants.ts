import type { SiteConfig } from '@/types/config';

export const routes = [
  { id: 'blog', name: 'Blog', path: '/blog/' },
  { id: 'tags', name: 'Tags', path: '/tags/' },
  { id: 'search', name: 'Search', path: '/search/' },
  { id: 'about', name: 'About', path: '/about/' },
] as const;

export const siteConfig = {
  lang: 'ja',
  siteName: 'uuki.dev',
  git: {
    enabled: true,
    repoUrl: 'https://github.com/uuki/uuki.dev',
    showHistory: true,
    maxCommits: 10,
  },
  social: {
    email: 'uuki@gmail.com',
    twitter: 'uuki_dev',
    github: 'uuki',
  },
} satisfies SiteConfig;
