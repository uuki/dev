import * as vscode from 'vscode';
import * as path from 'path';
import { processImage } from './fileHandler';

const IMAGE_FILTERS = {
  Images: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'avif'],
};

export async function insertImageCommand(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('[MDX Image Insert] アクティブなエディタがありません。');
    return;
  }

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
  if (!workspaceFolder) {
    vscode.window.showErrorMessage('[MDX Image Insert] ワークスペース外のファイルには使用できません。');
    return;
  }

  const uris = await vscode.window.showOpenDialog({
    canSelectMany: true,
    canSelectFiles: true,
    canSelectFolders: false,
    openLabel: '画像を選択',
    filters: IMAGE_FILTERS,
  });

  if (!uris || uris.length === 0) return;

  const snippetParts: string[] = [];
  let tabIndex = 1;

  for (const uri of uris) {
    const srcPath = uri.fsPath;
    try {
      const webPath = await processImage(srcPath, workspaceFolder.uri.fsPath);
      if (webPath === null) continue;

      const altDefault = path.basename(srcPath, path.extname(srcPath));
      snippetParts.push(`![\${${tabIndex++}:${altDefault}}](${webPath})`);
    } catch (err) {
      vscode.window.showErrorMessage(`[MDX Image Insert] 画像のコピーに失敗しました: ${err}`);
    }
  }

  if (snippetParts.length === 0) return;

  await editor.insertSnippet(
    new vscode.SnippetString(snippetParts.join('\n')),
    editor.selection.active,
  );
}
