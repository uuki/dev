import { getCollection } from 'astro:content';

export const POSTS_PER_PAGE = 10;

export const getSortedPosts = async () => {
  const allPosts = await getCollection('blog', ({ data }) => !data.draft);
  return allPosts.sort((a, b) => b.data.created_at.getTime() - a.data.created_at.getTime());
};

export const getBlogPageUrl = (page: number): string =>
  page === 1 ? '/blog/' : `/blog/page/${page}/`;
