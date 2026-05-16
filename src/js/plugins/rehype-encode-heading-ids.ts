import type { Plugin } from 'unified';
import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

export function rehypeEncodeHeadingIds(): ReturnType<Plugin<[], Root>> {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (/^h[1-6]$/.test(node.tagName) && node.properties?.id) {
        node.properties.id = encodeURIComponent(String(node.properties.id));
      }
    });
  };
}
