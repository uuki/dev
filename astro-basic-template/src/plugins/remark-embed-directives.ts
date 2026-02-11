import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

/**
 * Remark plugin to handle embed directives (youtube, twitter, vimeo, github)
 * Transforms ::: youtube, ::: twitter, etc. blocks into component imports
 */
export const remarkEmbedDirectives: Plugin<[], Root> = () => {
  return (tree: Root) => {
    const embedComponents: Set<string> = new Set();

    visit(tree, (node: any) => {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const data = node.data || (node.data = {});
        const hName = node.name;

        // Handle YouTube embeds
        if (hName === 'youtube') {
          const id = node.attributes?.id || '';
          embedComponents.add('YouTube');

          data.hName = 'YouTube';
          data.hProperties = {
            id,
            ...(node.attributes || {}),
          };
          node.children = [];
        }

        // Handle Twitter embeds
        if (hName === 'twitter') {
          const id = node.attributes?.id || '';
          embedComponents.add('Tweet');

          data.hName = 'Tweet';
          data.hProperties = {
            id,
            ...(node.attributes || {}),
          };
          node.children = [];
        }

        // Handle Vimeo embeds
        if (hName === 'vimeo') {
          const id = node.attributes?.id || '';
          embedComponents.add('Vimeo');

          data.hName = 'Vimeo';
          data.hProperties = {
            id,
            ...(node.attributes || {}),
          };
          node.children = [];
        }

        // Handle GitHub embeds (gist, repo)
        if (hName === 'github') {
          const url = node.attributes?.url || '';
          embedComponents.add('GitHub');

          data.hName = 'GitHub';
          data.hProperties = {
            url,
            ...(node.attributes || {}),
          };
          node.children = [];
        }
      }
    });

    // Add imports at the top of the file for embedded components
    if (embedComponents.size > 0) {
      const imports: any[] = [];

      if (embedComponents.has('YouTube')) {
        imports.push({
          type: 'mdxjsEsm',
          value: "import { YouTube } from '@astro-community/astro-embed-youtube';",
          data: {
            estree: {
              type: 'Program',
              body: [
                {
                  type: 'ImportDeclaration',
                  specifiers: [
                    {
                      type: 'ImportSpecifier',
                      imported: { type: 'Identifier', name: 'YouTube' },
                      local: { type: 'Identifier', name: 'YouTube' },
                    },
                  ],
                  source: {
                    type: 'Literal',
                    value: '@astro-community/astro-embed-youtube',
                  },
                },
              ],
              sourceType: 'module',
            },
          },
        });
      }

      if (embedComponents.has('Tweet')) {
        imports.push({
          type: 'mdxjsEsm',
          value: "import { Tweet } from '@astro-community/astro-embed-twitter';",
          data: {
            estree: {
              type: 'Program',
              body: [
                {
                  type: 'ImportDeclaration',
                  specifiers: [
                    {
                      type: 'ImportSpecifier',
                      imported: { type: 'Identifier', name: 'Tweet' },
                      local: { type: 'Identifier', name: 'Tweet' },
                    },
                  ],
                  source: {
                    type: 'Literal',
                    value: '@astro-community/astro-embed-twitter',
                  },
                },
              ],
              sourceType: 'module',
            },
          },
        });
      }

      if (embedComponents.has('Vimeo')) {
        imports.push({
          type: 'mdxjsEsm',
          value: "import { Vimeo } from '@astro-community/astro-embed-vimeo';",
          data: {
            estree: {
              type: 'Program',
              body: [
                {
                  type: 'ImportDeclaration',
                  specifiers: [
                    {
                      type: 'ImportSpecifier',
                      imported: { type: 'Identifier', name: 'Vimeo' },
                      local: { type: 'Identifier', name: 'Vimeo' },
                    },
                  ],
                  source: {
                    type: 'Literal',
                    value: '@astro-community/astro-embed-vimeo',
                  },
                },
              ],
              sourceType: 'module',
            },
          },
        });
      }

      // Add imports to the beginning of the tree
      tree.children.unshift(...imports);
    }
  };
};

export default remarkEmbedDirectives;
