# デプロイガイド

このプロジェクトは静的サイトとしてビルドされ、任意の静的ホスティングサービスにデプロイできます。

## 環境変数

デプロイ前に以下の環境変数を設定してください：

```bash
PUBLIC_ORIGIN=https://your-domain.com
PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX  # Optional
```

## ビルド設定

### Vercel

1. プロジェクトをVercelにインポート
2. Build Command: `pnpm build`
3. Output Directory: `dist`
4. Install Command: `pnpm install`
5. 環境変数を設定

または、`vercel.json`が自動的に設定を適用します。

### Netlify

1. プロジェクトをNetlifyにインポート
2. Build Command: `pnpm build`
3. Publish Directory: `dist`
4. 環境変数を設定

または、`netlify.toml`が自動的に設定を適用します。

### Cloudflare Pages

1. プロジェクトをCloudflare Pagesにインポート
2. Build Command: `pnpm build`
3. Build Output Directory: `dist`
4. 環境変数を設定

## ローカルでのプレビュー

ビルドしたサイトをローカルでプレビュー：

```bash
pnpm build
pnpm preview
```

## チェックリスト

デプロイ前の確認事項：

- [ ] `.env`に環境変数を設定
- [ ] `astro.config.mjs`の`site`設定を確認
- [ ] ビルドが成功することを確認（`pnpm build`）
- [ ] TypeScriptエラーがないことを確認（`pnpm astro check`）
- [ ] プレビューで表示を確認（`pnpm preview`）
- [ ] サイトマップが生成されていることを確認（`dist/sitemap-*.xml`）
- [ ] OGP画像が設定されていることを確認

## パフォーマンス

デプロイ後、以下のツールでパフォーマンスを測定することを推奨します：

- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [WebPageTest](https://www.webpagetest.org/)
- Chrome DevTools の Lighthouse

目標スコア：
- Performance: 95+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+
