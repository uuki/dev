import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import configData from '@/data/config.yml';

export const GET: APIRoute = async (context) => {
  // Get all published blog posts
  const posts = await getCollection('blog', ({ data }) => {
    return !data.draft && !data.url;
  });

  // Sort by created_at (newest first)
  const sortedPosts = posts.sort((a, b) => {
    return b.data.created_at.getTime() - a.data.created_at.getTime();
  });

  return rss({
    title: configData.siteName || 'uuki.dev',
    description: 'Tech blog and development notes',
    site: context.site || 'https://uuki.dev',
    items: sortedPosts.map((post) => {
      const slug = post.id.replace(/\.mdx?$/, '');
      return {
        title: post.data.title,
        description: post.data.description ?? undefined,
        pubDate: post.data.created_at,
        link: `/blog/${slug}/`,
        categories: post.data.tags || [],
        // Add author if available
        author: 'uuki@uuki.dev',
      };
    }),
    customData: `<language>ja</language>`,
    stylesheet: '/rss-styles.xsl', // Optional: add XSLT stylesheet
  });
};
