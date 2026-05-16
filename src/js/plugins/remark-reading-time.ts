import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import { toString } from 'mdast-util-to-string';

export function remarkReadingTime(): ReturnType<Plugin<[], Root>> {
  return (tree, { data }) => {
    const text = toString(tree);
    const words = text.split(/\s+/).filter(Boolean).length;
    (data as any).astro.frontmatter.readingTime = Math.ceil(words / 200);
  };
}
