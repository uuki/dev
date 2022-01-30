import React from 'react'

type MetaProps = {
  type?: string
  title: string
  siteName?: string
  description?: string
  url?: string
  image?: string
  locale?: string
  FB_APP_ID?: string
  TWITTER_CARD?: 'summary_large_image' | 'summary'
}

const OGP = ({ type, title, siteName, description, url, image, locale, FB_APP_ID, TWITTER_CARD }: MetaProps) => {
  return (
    <>
      <meta http-equiv="x-dns-prefetch-control" content="on" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="description" content={description} />
      <link rel="shortcut icon" href="/icon/favicon.ico" />
      <link rel="icon" type="image/png" href="/icon/favicon-32x32.png" sizes="32x32" />
      <link rel="icon" type="image/png" href="/icon/favicon-16x16.png" sizes="16x16" />
      <link rel="apple-touch-icon" sizes="180x180" href="/icon/apple-touch-icon.png" />
      <meta property="og:title" content={title} />
      {type && <meta property="og:type" content={type} />}
      {siteName && <meta property="og:site_name" content={siteName} />}
      {description && <meta property="og:description" content={description} />}
      {url && <meta property="og:url" content={url} />}
      {image && <meta property="og:image" content={image} />}
      {locale && <meta property="og:locale" content={locale} />}
      {FB_APP_ID && <meta property="fb:app_id" content={FB_APP_ID} />}
      {TWITTER_CARD && <meta property="twitter:card" content={TWITTER_CARD} />}
    </>
  )
}

export default OGP
