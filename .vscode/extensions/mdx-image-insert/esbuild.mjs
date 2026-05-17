import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

/** @type {import('esbuild').BuildOptions} */
const options = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  external: ['vscode', 'sharp'],
  outfile: 'dist/extension.js',
  sourcemap: watch ? 'inline' : false,
  minify: !watch,
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log('watching...');
} else {
  await esbuild.build(options);
}
