import * as vscode from 'vscode';
import { MdxImageDropProvider } from './dropProvider';
import { insertImageCommand } from './insertImageCommand';

export function activate(context: vscode.ExtensionContext): void {
  // Command: MDX: Insert Image (Cmd+Option+I)
  context.subscriptions.push(
    vscode.commands.registerCommand('mdxImageInsert.insertImage', insertImageCommand),
  );

  // Drop provider: handles drags from VS Code's own Explorer panel
  const provider = new MdxImageDropProvider();
  context.subscriptions.push(
    vscode.languages.registerDocumentDropEditProvider(
      [{ language: 'mdx' }, { language: 'markdown' }, { pattern: '**/*.mdx' }],
      provider,
    ),
  );
}

export function deactivate(): void {}
