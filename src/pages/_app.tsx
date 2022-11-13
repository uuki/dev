import type { AppProps } from 'next/app'
import Head from 'next/head'
import React from 'react'
import { RecoilRoot } from 'recoil'
import GoogleAnalytics from '@/components/functional/analytics/GoogleAnalytics'
import Modal from '@/components/functional/modal/Modal'
import { WindowProvider } from '@/plugins/windowState'
import { cssVars } from '@/constants'
import '@/styles/app.scss'

const withProvider = <T extends AppProps>(Component: React.FC<T>) => {
  const WrappedComponent = (props: T) => (
    <RecoilRoot>
      <WindowProvider cssVars={cssVars}>
        <Component {...props} />
      </WindowProvider>
    </RecoilRoot>
  )
  return WrappedComponent
}

const MyApp = withProvider(({ Component, pageProps }: AppProps) => {
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
      <Modal />
    </>
  )
})

export default MyApp
