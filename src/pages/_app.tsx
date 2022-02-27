import type { AppProps } from 'next/app'
import Head from 'next/head'
import GoogleAnalytics from '@/components/functional/analytics/GoogleAnalytics'
import '@/styles/app.scss'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <meta name="format-detection" content="telephone=no" />
        <meta property="twitter:card" content="summary_large_image" />
        <link rel="shortcut icon" href="/static/icon/favicon.ico" />
        <link rel="icon" type="image/png" href="/static/icon/favicon-32x32.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="/static/icon/favicon-16x16.png" sizes="16x16" />
      </Head>
      <GoogleAnalytics />
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
