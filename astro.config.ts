import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'astro/config';
import yaml from '@rollup/plugin-yaml';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';
import { remarkCustomDirectives } from './src/js/plugins/remark-custom-directives';
import { remarkEmbedDirectives } from './src/js/plugins/remark-embed-directives';
import { remarkOutdatedWarning } from './src/js/plugins/remark-outdated-warning';
import { remarkReadingTime } from './src/js/plugins/remark-reading-time';
import { blogTitleFetcher } from './integrations/blogTitleFetcher';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


const loadScssFiles = (dir: string, type: 'functions' | 'mixins') => {
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.scss'))
    .map(file => `@use "@/styles/tools/${type}/${file}" as *;`);
};

const functionsDir = path.resolve(__dirname, './src/styles/tools/functions');
const mixinsDir = path.resolve(__dirname, './src/styles/tools/mixins');
const functionFiles = loadScssFiles(functionsDir, 'functions');
const mixinFiles = loadScssFiles(mixinsDir, 'mixins');

const additionalScssData = [
  ...functionFiles,
  ...mixinFiles,
];

/**
 * @docs https://astro.build/config
 */
export default defineConfig({
  site: process.env.PUBLIC_ORIGIN || 'https://uuki.dev',
  devToolbar: {
    enabled: false
  },
  integrations: [
    blogTitleFetcher({ enabled: false }),
    expressiveCode({
      themes: ['nord', 'github-light'],
      plugins: [pluginLineNumbers()],
      shiki: {
        langAlias: {
          'shell-session': 'shellscript',
          'markup': 'html',
        },
      },
      styleOverrides: {
        borderRadius: '12px',
        borderWidth: '0',
        frames: {
          shadowColor: 'transparent',
        },
      },
    }),
    mdx(),
    svelte(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    sitemap(),
  ],
  markdown: {
    remarkPlugins: [
      remarkReadingTime,
      remarkDirective,
      remarkCustomDirectives,
      remarkEmbedDirectives,
      [remarkOutdatedWarning, {
        include: /\/data\/blog\//,
        enabled: true,
        yearsThreshold: 2,
        warningText: 'この記事は{years}年以上前に書かれた内容です。情報が古くなっている可能性があります。',
      }],
      remarkGfm,
      remarkMath,
    ],
    rehypePlugins: [
      [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      rehypeSlug,
      rehypeAutolinkHeadings,
      rehypeKatex,
    ],
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          charset: false,
          // Global addition styles (functions and mixins only)
          additionalData: additionalScssData.join('\n')
        }
      }
    },
    plugins: [yaml()],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './'),
        '@': path.resolve(__dirname, './src')
      }
    }
  }
});
