import Document, { DocumentContext, Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return {
      ...initialProps,
    }
  }

  render() {
    return (
      <Html lang="ja">
        <Head>
          <meta httpEquiv="x-dns-prefetch-control" content="on" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="description" content="uukiの技術ブログ" />
          <link rel="shortcut icon" href="/icon/favicon.ico" />
          <link rel="icon" type="image/png" href="/icon/favicon-32x32.png" sizes="32x32" />
          <link rel="icon" type="image/png" href="/icon/favicon-16x16.png" sizes="16x16" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icon/apple-touch-icon.png" />
          <meta property="og:title" content="uuki.dev" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="uuki.dev" />
          <meta property="og:description" content="uukiの技術ブログ" />
          <meta property="og:url" content="" />
          <meta property="og:image" content="" />
          <meta property="og:locale" content="ja_JP" />
          <meta property="twitter:card" content="summary_large_image" />
        </Head>

        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
