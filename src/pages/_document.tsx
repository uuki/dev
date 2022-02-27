import Document, { Html, Head, Main, NextScript } from 'next/document'
import MetaOpenGraph from '@/components/functional/meta/MetaOpenGraph'

class MyDocument extends Document {
  render() {
    return (
      <Html lang="ja">
        <Head>
          <meta httpEquiv="x-dns-prefetch-control" content="on" />
        </Head>
        <MetaOpenGraph type="article" />
        <body className="md:text-[16px] sm:text-[14px]">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
