import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'astro/config';
import yaml from '@rollup/plugin-yaml';
import svelte from '@astrojs/svelte';
import mdx from '@astrojs/mdx';
import expressiveCode from 'astro-expressive-code';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeKatex from 'rehype-katex';
import { remarkCustomDirectives } from './src/plugins/remark-custom-directives';
import { remarkEmbedDirectives } from './src/plugins/remark-embed-directives';
import { remarkOutdatedWarning } from './src/plugins/remark-outdated-warning';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @docs https://astro.build/config
 */
export default defineConfig({
  site: process.env.PUBLIC_ORIGIN || 'https://uuki.dev',
  devToolbar: {
    enabled: false
  },
  integrations: [
    expressiveCode({
      // Shiki設定（Prismから移行）
      themes: ['github-dark', 'github-light'],
      shiki: {
        langAlias: {
          'shell-session': 'shellscript',
          'markup': 'html',
        },
      },
      styleOverrides: {
        borderRadius: '8px',
        borderWidth: '1px',
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
      remarkDirective,
      remarkCustomDirectives,
      remarkEmbedDirectives,
      [remarkOutdatedWarning, {
        enabled: true,
        yearsThreshold: 2,
        warningText: 'この記事は{years}年以上前に書かれた内容です。情報が古くなっている可能性があります。',
      }],
      remarkGfm,
      remarkMath,
    ],
    rehypePlugins: [
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
          additionalData: [
            '@use "@/styles/tools/functions/_rem.scss" as *;',
            '@use "@/styles/tools/functions/_liquid.scss" as *;', // planned refactoring
            '@use "@/styles/tools/mixins/_line-clamp.scss" as *;',
            '@use "@/styles/tools/mixins/_link.scss" as *;', // planned refactoring
            '@use "@/styles/tools/mixins/_marker.scss" as *;',
            '@use "@/styles/tools/mixins/_smoothing.scss" as *;',
            '@use "@/styles/tools/mixins/_underline.scss" as *;',
            '@use "@/styles/tools/mixins/_staggered.scss" as *;', // planned refactoring
            '@use "@/styles/tools/mixins/_typography.scss" as *;',
          ].join('\n')
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
