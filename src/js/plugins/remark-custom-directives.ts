import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

/**
 * Remark plugin to handle custom directives (note, warning, info, tip)
 * Transforms ::: note, ::: warning, ::: info, ::: tip blocks into custom HTML
 */
export const remarkCustomDirectives: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, (node: any) => {
      // Handle MDX <Note> component (from Next.js migration)
      if (node.type === 'mdxJsxFlowElement' && node.name === 'Note') {
        const typeAttr = node.attributes?.find((attr: any) => attr.name === 'type');
        const noteType = typeAttr?.value || 'note';

        node.data = node.data || {};
        node.data.hName = 'div';
        node.data.hProperties = {
          className: ['remark-directive', `remark-directive--${noteType}`],
        };
      }

      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const data = node.data || (node.data = {});
        const hName = node.name;

        // Handle note, warning, info, tip directives
        if (['note', 'warning', 'info', 'tip'].includes(hName)) {
          data.hName = 'div';
          data.hProperties = {
            className: ['remark-directive', `remark-directive--${hName}`],
            ...(node.attributes || {}),
          };

          // Add icon and title if label is provided
          if (node.attributes?.label) {
            const iconMap: Record<string, string> = {
              note: '📝',
              warning: '⚠️',
              info: 'ℹ️',
              tip: '💡',
            };

            // Insert title node at the beginning
            node.children.unshift({
              type: 'paragraph',
              data: {
                hName: 'div',
                hProperties: { className: ['remark-directive__title'] },
              },
              children: [
                {
                  type: 'text',
                  value: `${iconMap[hName]} ${node.attributes.label}`,
                },
              ],
            });
          }
        }
      }
    });
  };
};

export default remarkCustomDirectives;
