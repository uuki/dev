import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

/**
 * Remark plugin to handle embed directives (youtube, twitter, vimeo, github)
 * Transforms ::: youtube, ::: twitter, etc. blocks into component imports
 */
/**
 * Extract Twitter/X post ID from URL
 */
function extractTwitterId(url: string): string | null {
  const patterns = [
    /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/,
    /(?:twitter\.com|x\.com)\/.*\/status\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export const remarkEmbedDirectives: Plugin<[], Root> = () => {
  return (tree: Root) => {
    const embedComponents: Set<string> = new Set();

    visit(tree, (node: any) => {
      // Auto-detect Twitter/X links and convert to embeds
      if (node.type === 'paragraph') {
        // Check if paragraph contains only a single link
        if (node.children?.length === 1 && node.children[0].type === 'link') {
          const linkNode = node.children[0];
          const url = linkNode.url || '';
          const twitterId = extractTwitterId(url);

          if (twitterId) {
            embedComponents.add('Tweet');

            // Transform paragraph into Tweet component
            node.type = 'html';
            node.value = '';
            node.data = {
              hName: 'Tweet',
              hProperties: {
                id: twitterId,
              },
            };
            delete node.children;
          }
        }
      }

      // Also handle standalone links (not in paragraphs)
      if (node.type === 'link') {
        const url = node.url || '';
        const twitterId = extractTwitterId(url);

        // Only convert if the link text is the same as URL (likely auto-link)
        if (twitterId && node.children?.length === 1 &&
            node.children[0].type === 'text' &&
            node.children[0].value === url) {
          embedComponents.add('Tweet');

          node.type = 'html';
          node.value = '';
          node.data = {
            hName: 'Tweet',
            hProperties: {
              id: twitterId,
            },
          };
          delete node.children;
          delete node.url;
        }
      }

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
