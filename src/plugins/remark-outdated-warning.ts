import type { Plugin } from 'unified';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

interface OutdatedWarningOptions {
  enabled?: boolean;
  yearsThreshold?: number;
  warningText?: string;
}

/**
 * Remark plugin to automatically add outdated warning to old posts
 * Adds a warning directive at the beginning of posts older than configured threshold
 */
export function remarkOutdatedWarning(options: OutdatedWarningOptions = {}): ReturnType<Plugin<[], Root>> {
  const {
    enabled = true,
    yearsThreshold = 2,
    warningText = 'この記事は{years}年以上前に書かれた内容です。情報が古くなっている可能性があります。',
  } = options;

  return (tree, file) => {
    // Skip if feature is disabled
    if (!enabled) {
      return;
    }

    // Get frontmatter data
    const frontmatter = (file.data as any).astro?.frontmatter;
    if (!frontmatter?.created_at) {
      return;
    }

    // Calculate years since creation
    const createdDate = new Date(frontmatter.created_at);
    const now = new Date();
    const yearsDiff = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    // Skip if not old enough
    if (yearsDiff < yearsThreshold) {
      return;
    }

    // Generate warning text with years interpolation
    const years = Math.floor(yearsDiff);
    const finalWarningText = warningText.replace('{years}', String(years));

    // Create warning directive node
    const warningNode = {
      type: 'containerDirective',
      name: 'warning',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              value: finalWarningText.trim(),
            },
          ],
        },
      ],
      data: {
        hName: 'div',
        hProperties: {
          className: ['outdated-warning'],
        },
      },
    };

    // Insert at the beginning of the document
    // Find the first non-heading node to insert after headings if they exist
    let insertIndex = 0;
    visit(tree, (node, index) => {
      if (index !== undefined && node.type !== 'heading' && insertIndex === 0) {
        insertIndex = index;
        return false; // Stop visiting
      }
    });

    // Insert the warning node
    tree.children.splice(insertIndex, 0, warningNode as any);
  };
};
