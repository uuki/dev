# ブログ投稿ガイドライン

## 記事ファイルの構成

記事は `src/data/blog/<slug>.mdx` に配置します。ファイル名がそのまま URL のスラッグになります。

```
src/data/blog/
├── my-first-post.mdx   → /blog/my-first-post/
└── astro-tips.mdx      → /blog/astro-tips/
```

### フロントマターのフィールド

```yaml
---
title: 記事タイトル
description: 記事の概要（OGP・SEO に使用）
created_at: 2026-01-01T00:00:00.000Z   # 公開日
updated_at: 2026-01-01T00:00:00.000Z   # 最終更新日（自動更新）
draft: false                            # true にするとビルド対象外
tags:
  - Astro
  - TypeScript
url: https://zenn.dev/...              # 外部記事の場合のみ記載
---
```

- `created_at` が公開日として扱われます
- `updated_at` は FrontMatter が保存のたびに自動更新します
- `url` は Zenn・Qiita など外部サービスへのリンク記事に使います（省略可）

---

## VS Code FrontMatter による記事管理

記事データの管理には **FrontMatter CMS**（VS Code 拡張: `eliostruyf.vscode-front-matter`）を使います。

### パネルの開き方

アクティビティバーの FrontMatter アイコン、またはコマンドパレットから `FrontMatter: Open panel` を実行します。MDX ファイルを開いた状態でパネルを開くと、そのファイルのフィールドが編集できます。

### 新規記事の作成

FrontMatter ダッシュボード（`FrontMatter: Open dashboard`）の **Create content** ボタンから作成します。ファイル名（= スラッグ）を入力すると `src/data/blog/<name>.mdx` が生成され、フロントマターのひな形が自動挿入されます。

---

## ドラフト機能

フロントマターの `draft` フィールドで公開・非公開を制御します。

| 値 | 動作 |
|---|---|
| `false` | 本番ビルドに含まれ公開される |
| `true` | ビルド対象外・一覧にも表示されない |

FrontMatter パネルの **Is in draft** トグルで切り替えられます。

---

## 画像の挿入（mdx-image-insert）

ローカル画像の挿入には **mdx-image-insert** 拡張（`.vscode/extensions/mdx-image-insert`）を使います。

### 操作方法

MDX ファイルを開いた状態でショートカットを押すとファイル選択ダイアログが開きます。

| OS | ショートカット |
|---|---|
| macOS | `Cmd + Alt + I` |
| Windows / Linux | `Ctrl + Alt + I` |

### 保存先と挿入パス

選択した画像は以下に自動コピーされます。

```
public/media/<year>/<month>/<filename>.webp
```

MDX に挿入されるパスは `public/` を除いたものになります。

```markdown
![](./media/2026/05/my-image.webp)
```

### WebP 最適化

PNG・JPEG などの画像は `sharp` によって自動的に WebP へ変換されます（品質: 82）。
以下の形式は変換をスキップしてそのままコピーされます。

- `.webp` — すでに最適化済み
- `.svg` — ベクター形式のため変換対象外

変換に失敗した場合は元ファイルがそのまま保存されます（フォールバック）。

同名ファイルが存在する場合はサフィックスを付けてリネームされます（例: `image-1.webp`）。

---

## タグ管理

### タグの追加

FrontMatter パネルの **Tags** 欄に入力します。既存タグはサジェストとして表示されます。

### タグ一覧の同期

新規タグをコミットすると、`pre-commit` フック（Husky）が `scripts/sync-tags.mjs` を自動実行し、全 MDX からタグを収集して `.frontmatter/database/taxonomyDb.json` を更新します。次回以降のパネルで新しいタグもサジェストに出るようになります。

手動で今すぐ同期したい場合は以下を実行します。

```sh
pnpm sync:tags
```

---

## remark / rehype 拡張構文

### コールアウトブロック（remark-directive）

`:::` 記法でコールアウトを挿入できます。

```markdown
:::note
メモの内容
:::

:::warning
警告の内容
:::

:::info
情報の内容
:::

:::tip
ヒントの内容
:::
```

`label` 属性でタイトルを付けられます。

```markdown
:::note{label="補足"}
内容
:::
```

### 埋め込みコンテンツ（remark-embed-directives）

#### YouTube

```markdown
:::youtube{id="dQw4w9WgXcQ"}
:::
```

#### X（旧 Twitter）

URL を単独の行に貼るだけで自動的に埋め込みになります。

```
https://x.com/user/status/1234567890
```

または明示的に指定することもできます。

```markdown
:::twitter{id="1234567890"}
:::
```

#### Vimeo

```markdown
:::vimeo{id="123456789"}
:::
```

#### GitHub

```markdown
:::github{url="https://github.com/user/repo"}
:::
```

### 数式（remark-math + rehype-katex）

インライン数式は `$...$`、ブロック数式は `$$...$$` で記述します。

```markdown
インライン: $E = mc^2$

ブロック:
$$
\int_0^\infty e^{-x^2} dx = \frac{\sqrt{\pi}}{2}
$$
```

### コードブロック（Expressive Code）

シンタックスハイライトには Expressive Code を使用しています。テーマは Nord（ダーク）と GitHub Light（ライト）で自動切替されます。

行番号を表示するには `showLineNumbers` を指定します。

````markdown
```ts showLineNumbers
const greeting = 'hello';
```
````

### その他の Markdown 拡張

| 機能 | 記法 | 備考 |
|---|---|---|
| テーブル・打ち消し線など | GFM 準拠 | `remarkGfm` |
| 改行 → `<br>` | 行末の改行 | `remarkBreaks` |
| 外部リンク | 自動で `target="_blank"` | `rehypeExternalLinks` |
| 見出しアンカー | 見出しに ID と `#` リンクを付与 | `rehypeSlug` + `rehypeAutolinkHeadings` |

### 古い記事への自動警告

`created_at` から 2 年以上経過した記事には、記事冒頭に自動で警告ブロックが挿入されます。

---

## 投稿の手順

1. FrontMatter ダッシュボードから **Create content** で MDX ファイルを作成
2. `draft: true` のまま本文を執筆
3. 画像は `Cmd + Alt + I` で挿入
4. FrontMatter パネルでタグを設定
5. 公開する場合は `draft: false` に変更
6. `git add` → `git commit`（`pre-commit` でタグ DB が自動同期される）
