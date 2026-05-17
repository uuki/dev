import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { shouldOptimize, toWebPPath, convertToWebP } from './optimizer';

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif']);

export function isImagePath(filePath: string): boolean {
  return IMAGE_EXTS.has(path.extname(filePath).toLowerCase());
}

interface Config {
  destination: string;
  webRoot: string;
  onConflict: 'overwrite' | 'rename' | 'prompt';
}

function getConfig(): Config {
  const cfg = vscode.workspace.getConfiguration('mdxImageInsert');
  return {
    destination: cfg.get<string>('destination', 'public/media/${year}/${month}/'),
    webRoot:     cfg.get<string>('webRoot', 'public'),
    onConflict:  cfg.get<'overwrite' | 'rename' | 'prompt'>('onConflict', 'rename'),
  };
}

function resolveDestDir(workspaceRoot: string, pattern: string): string {
  const now = new Date();
  const year  = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return path.join(
    workspaceRoot,
    pattern.replace('${year}', year).replace('${month}', month),
  );
}

function toWebPath(absPath: string, workspaceRoot: string, webRoot: string): string {
  const rel    = path.relative(workspaceRoot, absPath).replace(/\\/g, '/');
  const prefix = webRoot.replace(/\\/g, '/').replace(/\/$/, '') + '/';
  return '/' + (rel.startsWith(prefix) ? rel.slice(prefix.length) : rel);
}

function pathExists(p: string): boolean {
  try { fsSync.accessSync(p); return true; } catch { return false; }
}

async function uniquePath(base: string): Promise<string> {
  if (!pathExists(base)) return base;
  const dir  = path.dirname(base);
  const ext  = path.extname(base);
  const name = path.basename(base, ext);
  for (let i = 1; ; i++) {
    const candidate = path.join(dir, `${name}-${i}${ext}`);
    if (!pathExists(candidate)) return candidate;
  }
}

/**
 * Saves the image to the configured destination and returns its web-root-relative path.
 * If optimize.enabled is true, converts to WebP before saving.
 * Returns null if the user cancelled a prompt.
 */
export async function processImage(
  srcPath: string,
  workspaceRoot: string,
): Promise<string | null> {
  const { destination, webRoot, onConflict } = getConfig();
  const optimize = shouldOptimize(srcPath);

  const destDir   = resolveDestDir(workspaceRoot, destination);
  const srcBase   = path.basename(srcPath);
  // When optimizing, the saved file will be .webp regardless of the source extension
  const destBase  = optimize ? srcBase.replace(/\.[^.]+$/, '.webp') : srcBase;
  const rawDest   = path.join(destDir, destBase);

  await fs.mkdir(destDir, { recursive: true });

  let finalDest: string;

  if (!pathExists(rawDest) || onConflict === 'overwrite') {
    finalDest = rawDest;
  } else if (onConflict === 'rename') {
    finalDest = await uniquePath(rawDest);
  } else {
    const choice = await vscode.window.showWarningMessage(
      `"${destBase}" は既に存在します`,
      { modal: false },
      '上書き',
      '別名で保存',
    );
    if (!choice) return null;
    finalDest = choice === '上書き' ? rawDest : await uniquePath(rawDest);
  }

  if (optimize) {
    const cfg = vscode.workspace.getConfiguration('mdxImageInsert');
    const fallback = cfg.get<boolean>('optimize.fallbackOnError', true);
    try {
      await convertToWebP(srcPath, finalDest);
    } catch (err) {
      if (!fallback) throw err;
      // Conversion failed — copy the original file as-is
      const fallbackDest = path.join(path.dirname(finalDest), srcBase);
      await fs.copyFile(srcPath, fallbackDest);
      vscode.window.showWarningMessage(
        `[MDX Image Insert] WebP 変換に失敗しました (${err instanceof Error ? err.message : String(err)})。元ファイルをそのまま保存しました。`,
      );
      return toWebPath(fallbackDest, workspaceRoot, webRoot);
    }
  } else {
    await fs.copyFile(srcPath, finalDest);
  }

  return toWebPath(finalDest, workspaceRoot, webRoot);
}
