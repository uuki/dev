import * as vscode from 'vscode';
import * as path from 'path';
import { isImagePath, processImage } from './fileHandler';

/** Tries multiple DataTransfer keys to extract file:// URIs from an OS drop. */
async function extractImagePaths(dataTransfer: vscode.DataTransfer): Promise<string[]> {
  const candidates: string[] = [];

  // Primary: standard URI list (Electron translates OS file drops to this)
  const uriItem = dataTransfer.get('text/uri-list');
  if (uriItem) {
    const raw = await uriItem.asString();
    candidates.push(...raw.split(/\r?\n/).map(s => s.trim()));
  }

  // Fallback: some VS Code versions surface the path under 'text/plain'
  if (candidates.length === 0) {
    const plainItem = dataTransfer.get('text/plain');
    if (plainItem) {
      const raw = await plainItem.asString();
      candidates.push(...raw.split(/\r?\n/).map(s => s.trim()));
    }
  }

  return candidates
    .filter(s => s.startsWith('file://'))
    .map(s => vscode.Uri.parse(s).fsPath)
    .filter(isImagePath);
}

export class MdxImageDropProvider implements vscode.DocumentDropEditProvider {
  async provideDocumentDropEdits(
    document: vscode.TextDocument,
    _position: vscode.Position,
    dataTransfer: vscode.DataTransfer,
    token: vscode.CancellationToken,
  ): Promise<vscode.DocumentDropEdit | undefined> {

    const imagePaths = await extractImagePaths(dataTransfer);
    if (token.isCancellationRequested) return;
    if (imagePaths.length === 0) return;

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) return;

    const snippetParts: string[] = [];
    let tabIndex = 1;

    for (const srcPath of imagePaths) {
      if (token.isCancellationRequested) return;
      try {
        const webPath = await processImage(srcPath, workspaceFolder.uri.fsPath);
        if (webPath === null) continue;

        const altDefault = path.basename(srcPath, path.extname(srcPath));
        snippetParts.push(`![\${${tabIndex++}:${altDefault}}](${webPath})`);
      } catch (err) {
        vscode.window.showErrorMessage(`[mdx-image-insert] 画像のコピーに失敗しました: ${err}`);
      }
    }

    if (snippetParts.length === 0) return;

    const edit = new vscode.DocumentDropEdit(
      new vscode.SnippetString(snippetParts.join('\n')),
    );
    edit.label = 'Insert as Markdown image';
    return edit;
  }
}
