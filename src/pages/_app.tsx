import { MDXProvider } from '@mdx-js/react'
import '@/styles/app.scss'
import Image from 'next/image'
import type { AppProps } from 'next/app'

const mdComponents = {
  image: Image,
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MDXProvider components={mdComponents}>
      <Component {...pageProps} />
    </MDXProvider>
  )
}

export default MyApp
