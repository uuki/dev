import type { SiteConfig, SocialType, ContactType } from '@/types/config';

export const routes = [
  { id: 'blog', name: 'Blog', path: '/blog/' },
  { id: 'tags', name: 'Tags', path: '/tags/' },
  { id: 'search', name: 'Search', path: '/search/' },
  { id: 'about', name: 'About', path: '/about/' },
] as const;

const rawIconGlob = import.meta.glob<string>('../assets/icons/*.svg', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const iconMap: Record<string, string> = Object.fromEntries(
  Object.entries(rawIconGlob).map(([path, raw]) => [
    path.replace(/^.*\/(.+)\.svg$/, '$1'),
    raw,
  ])
);

export type IconName = keyof typeof iconMap;

export const siteConfig = {
  lang: 'ja',
  siteName: 'uuki.dev',
  git: {
    enabled: true,
    repoUrl: 'https://github.com/uuki/uuki.dev',
    showHistory: true,
    maxCommits: 10,
  },
  social: [
    { type: 'x',      url: 'https://twitter.com/uuki_dev', handle: '@uuki_dev', label: 'X (Twitter)' },
    { type: 'github', url: 'https://github.com/uuki',      handle: 'uuki',      label: 'GitHub'      },
  ],
  contact: [
    { type: 'email', url: 'mailto:uuki@gmail.com', handle: 'uuki@gmail.com', label: 'Email' },
  ],
  feeds: {
    atom: '/atom.xml',
    rss:  '/rss.xml',
  },
} satisfies SiteConfig;

export const socialIconMap: Record<SocialType, string> = {
  x:      iconMap['x'],
  github: iconMap['github'],
};

export const contactIconMap: Record<ContactType, string> = {
  email: iconMap['email'],
};
