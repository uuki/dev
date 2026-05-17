# mdx-image-insert

MDX / Markdown ファイルに画像を挿入する際、プロジェクト内の所定のディレクトリにコピーして  
マークダウン記法でカーソル位置に挿入するローカル VS Code 拡張です。  
PNG / JPG 等は自動的に WebP へ変換して保存します（SVG と WebP はスキップ）。

## 動作

### コマンド（主な使い方）

1. MDX ファイルでカーソルを挿入位置に置く
2. `Cmd+Option+I`（Windows: `Ctrl+Alt+I`）を押す  
   または コマンドパレット → `MDX: Insert Image`
3. ネイティブのファイルダイアログで画像を選択（複数選択可）
4. `destination` ディレクトリに画像をコピー（PNG / JPG は WebP に変換）
5. カーソル位置に alt テキストが tabstop になったスニペットを挿入

```markdown
![${1:filename}](/media/2026/05/filename.webp)
```

複数ファイルを選択すると、それぞれ連番の tabstop で挿入されます。

> **Note**: OS（Finder 等）からのドラッグ＆ドロップは VS Code の Electron レベルで  
> 「ファイルを開く」動作が優先されるため、コマンド方式を採用しています。  
> VS Code の Explorer パネルからのドラッグはドロッププロバイダーで処理されます。

## 設定

`settings.json` から変更できます（ワークスペース設定推奨）。

| キー | デフォルト | 説明 |
|---|---|---|
| `mdxImageInsert.destination` | `public/media/${year}/${month}/` | コピー先。`${year}` / `${month}` が使用可能 |
| `mdxImageInsert.webRoot` | `public` | Web ルートとして扱うディレクトリ。挿入パスの生成時に除去される |
| `mdxImageInsert.onConflict` | `rename` | ファイル名衝突時の動作。`overwrite` / `rename` / `prompt` |
| `mdxImageInsert.optimize.enabled` | `true` | WebP 変換を有効にする（SVG / WebP ソースは自動スキップ） |
| `mdxImageInsert.optimize.quality` | `82` | WebP 品質（1–100） |
| `mdxImageInsert.optimize.fallbackOnError` | `true` | 変換失敗時に元ファイルをそのままコピー |

### 設定例（このプロジェクトのデフォルト）

```json
{
  "mdxImageInsert.destination": "public/media/${year}/${month}/",
  "mdxImageInsert.webRoot": "public",
  "mdxImageInsert.onConflict": "rename"
}
```

`public/media/2026/05/image.png` → WebP 変換後 `public/media/2026/05/image.webp` として保存され、`/media/2026/05/image.webp` として挿入されます。

---

## 開発フロー

### 前提

- Node.js 18+
- pnpm
- メインプロジェクトに `sharp` がインストールされていること（`pnpm add -D sharp` in root）

### セットアップ

```bash
cd .vscode/extensions/mdx-image-insert
pnpm install
```

### ビルド

```bash
pnpm build
```

`dist/extension.js` が生成されます。

### ウォッチモード

```bash
pnpm watch
```

ファイル変更を検知して自動再ビルドします。  
拡張を再読み込みするには VS Code のコマンドパレットから  
`Developer: Reload Window` を実行してください。

### デバッグ（Extension Development Host）

1. VS Code で `.vscode/extensions/mdx-image-insert/` フォルダを開く
2. `F5` キーを押す（`launch.json` を別途用意するか、`.vscode/launch.json` を作成）
3. 新しい VS Code ウィンドウ（Extension Development Host）が開き、拡張が有効な状態でデバッグできる

#### launch.json の例

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run Extension",
      "type": "extensionHost",
      "request": "launch",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"],
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "preLaunchTask": "pnpm: build"
    }
  ]
}
```

---

## 配布フロー

### パッケージ化（.vsix）

```bash
pnpm package
```

`mdx-image-insert-x.x.x.vsix` が生成されます。

### インストール

**コマンドラインから：**

```bash
code --install-extension mdx-image-insert-x.x.x.vsix
```

**VS Code UI から：**

1. コマンドパレット → `Extensions: Install from VSIX...`
2. 生成した `.vsix` ファイルを選択

### アップデート時

1. `package.json` の `version` を上げる
2. `pnpm package` で再パッケージ
3. `code --install-extension mdx-image-insert-x.x.x.vsix` で上書きインストール

> `.vsix` ファイルはリポジトリに含めず、都度ビルドしてインストールする運用を推奨します。

---

## ファイル構成

```
mdx-image-insert/
├── src/
│   ├── extension.ts          # activate / deactivate エントリポイント
│   ├── dropProvider.ts       # DocumentDropEditProvider — Explorer ドラッグの処理
│   ├── insertImageCommand.ts # コマンド — ファイルダイアログから画像を挿入
│   ├── fileHandler.ts        # ファイルコピー・パス解決・競合処理
│   └── optimizer.ts          # WebP 変換（sharp をワークスペースから動的ロード）
├── dist/                     # ビルド成果物（.gitignore 推奨）
│   └── extension.js
├── esbuild.mjs               # バンドル設定
├── tsconfig.json
├── package.json
├── .vscodeignore             # vsix パッケージから除外するファイル
└── README.md
```
