/**
 * PostCSS plugin: wrap CSS output in @layer based on file path.
 *
 * Layer priority (highest → lowest specificity wins):
 *   unlayered > utilities > components > base
 */

const LAYER_MAP = [
  { pattern: /\.module\.scss$/, layer: 'components' },
  { pattern: /[/\\]utilities[/\\]/, layer: 'utilities' },
  { pattern: /[/\\](base|generic)[/\\]/, layer: 'base' },
  { pattern: /[/\\]tools[/\\]plugins[/\\]/, layer: 'plugins' },
  { pattern: /[/\\]tools[/\\]animations[/\\]/, layer: 'animations' },
];

/** @type {() => import('postcss').Plugin} */
module.exports = () => ({
  postcssPlugin: 'postcss-layer-wrap',
  OnceExit(root, { AtRule }) {
    const from = root.source?.input?.file ?? '';
    const match = LAYER_MAP.find(({ pattern }) => pattern.test(from));
    if (!match) return;

    const nodes = root.nodes.slice();
    if (nodes.length === 0) return;

    const layer = new AtRule({ name: 'layer', params: match.layer });
    nodes.forEach(node => layer.append(node.clone()));
    root.removeAll();
    root.append(layer);
  },
});
