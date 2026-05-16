import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOgImage } from '@/utils/ogp';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft && !data.url);
  return posts.map((post) => ({
    params: { slug: post.id.replace(/\.mdx?$/, '') },
    props: { title: post.data.title },
  }));
};

interface Props {
  title: string;
}

export const GET: APIRoute = async ({ props }) => {
  const { title } = props as Props;
  const png = await generateOgImage(title);
  return new Response(png, {
    headers: { 'Content-Type': 'image/png' },
  });
};
