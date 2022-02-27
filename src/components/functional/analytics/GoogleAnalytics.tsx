import Script from 'next/script'
import { isDev } from '@/utils/flags'
import configManage from '@/config/manage'

const GoogleAnalytics = () => {
  return isDev ? null : (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${configManage.google_analytics_id}`}
        strategy="lazyOnload"
      />

      <Script id="ga-script" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${configManage.google_analytics_id}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}

export default GoogleAnalytics
