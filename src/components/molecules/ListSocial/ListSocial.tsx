import { SiTwitter, SiHatenabookmark, SiPocket } from 'react-icons/si'
import config from '@/config/meta'

type ListSocialProps = {
  pathname: string
  text?: string
}

const ListSocial = ({ pathname, text = '' }: ListSocialProps) => {
  const url = encodeURIComponent(`${config.SITE_URL.replace(/\/$/, '')}${pathname}`)
  const urlText = text ? `${encodeURIComponent(text)} - ${config.SITE_NAME}` : ''

  const params = {
    twitter: {
      url,
      ...(urlText && { text: urlText }),
    },
    hatena: {
      url,
      mode: 'confirm',
    },
    pocket: {
      url,
      ...(urlText && { text: urlText }),
    },
  }

  const createQueryString = (params: { [key: string]: string }) => {
    return Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join('&')
  }

  const ShareItems = [
    {
      url: `https://twitter.com/intent/tweet?${createQueryString(params.twitter)}`,
      icon: <SiTwitter className="text-twitter" />,
    },
    {
      url: `http://b.hatena.ne.jp/add?${createQueryString(params.hatena)}`,
      icon: <SiHatenabookmark className="text-hatena" />,
    },
    {
      url: `https://getpocket.com/edit?${createQueryString(params.pocket)}`,
      icon: <SiPocket className="text-pocket" />,
    },
  ]

  const handleShare = (shareUrl: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
    window.open(shareUrl, '', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=400,width=580')
  }

  return (
    <ul className="inline-flex items-center mx-[-10px]">
      {ShareItems.map((it) => (
        <li key={it.url} className="mx-[10px]">
          <button
            type="button"
            className="flex justify-center items-center text-[1.25rem] bg-white shadow-button w-[40px] h-[40px] rounded-full"
            onClick={handleShare(it.url)}
          >
            {it.icon}
          </button>
        </li>
      ))}
    </ul>
  )
}

export { ListSocial }
