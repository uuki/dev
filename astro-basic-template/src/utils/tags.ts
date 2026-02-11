import { getCollection } from 'astro:content';
import slugify from 'slugify';

/**
 * Get all tags with their post counts
 * Returns a Record where keys are slugified tag names and values are counts
 */
export async function getAllTags(): Promise<Record<string, number>> {
  const allPosts = await getCollection('blog', ({ data }) => {
    return !data.draft;
  });

  const tagCount: Record<string, number> = {};

  allPosts.forEach((post) => {
    post.data.tags?.forEach((tag: string) => {
      const formattedTag = slugify(tag);
      tagCount[formattedTag] = (tagCount[formattedTag] || 0) + 1;
    });
  });

  return tagCount;
}

/**
 * Get all unique tag names (original, not slugified)
 */
export async function getAllTagNames(): Promise<string[]> {
  const allPosts = await getCollection('blog', ({ data }) => {
    return !data.draft;
  });

  const tagSet = new Set<string>();

  allPosts.forEach((post) => {
    post.data.tags?.forEach((tag: string) => {
      tagSet.add(tag);
    });
  });

  return Array.from(tagSet);
}
