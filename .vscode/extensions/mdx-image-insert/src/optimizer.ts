import * as path from 'path';
import * as vscode from 'vscode';

// SVG is vector; WebP is already optimal — skip conversion
const SKIP_EXTS = new Set(['.svg', '.webp']);

export function shouldOptimize(srcPath: string): boolean {
  const cfg = vscode.workspace.getConfiguration('mdxImageInsert');
  if (!cfg.get<boolean>('optimize.enabled', true)) return false;
  return !SKIP_EXTS.has(path.extname(srcPath).toLowerCase());
}

/** Returns the WebP destination path (same dir, extension replaced). */
export function toWebPPath(destPath: string): string {
  return destPath.replace(/\.[^.]+$/, '.webp');
}

/**
 * Loads sharp from the workspace root's node_modules.
 * sharp lives in the main project's devDependencies, not the extension bundle.
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const _require = require;

function loadSharp(): typeof import('sharp')['default'] {
  const wsRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  if (!wsRoot) throw new Error('No workspace folder open.');

  const sharpPath = _require.resolve('sharp', { paths: [wsRoot] });
  const mod = _require(sharpPath);
  return mod.default ?? mod;
}

/**
 * Converts srcPath to WebP and writes to destPath.
 * destPath is expected to already have a .webp extension.
 */
export async function convertToWebP(srcPath: string, destPath: string): Promise<void> {
  const sharp = loadSharp();
  const cfg = vscode.workspace.getConfiguration('mdxImageInsert');
  const quality = cfg.get<number>('optimize.quality', 82);

  await sharp(srcPath)
    .webp({ quality })
    .toFile(destPath);
}
