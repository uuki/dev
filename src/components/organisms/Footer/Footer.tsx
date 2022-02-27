import { memo } from 'react'
import { ListMenu } from '@/components/molecules/ListMenu'
import { SiTwitter, SiGithub, SiRss } from 'react-icons/si'
import { Link } from '@/components/atoms/Link'

const Footer = memo(() => {
  const SocialItems = [
    {
      url: 'https://twitter.com/uuki_dev',
      icon: <SiTwitter className="text-[1.2rem]" />,
    },
    {
      url: 'http://github.com/uuki',
      icon: <SiGithub className="text-[1.2rem]" />,
    },
    {
      url: '/atom.xml',
      icon: <SiRss className="text-[1.08rem]" />,
    },
  ]

  return (
    <footer className="text-white bg-navy-600 pb-[15px]">
      <div className="text-center px-content">
        <ul className="inline-flex items-center flex-wrap px-[30px] py-[6px] bg-navy-400 rounded-b-md">
          {SocialItems.map((it, i) => (
            <li key={i} className="mx-[10px]">
              <Link href={it.url} className="block link-opacity">
                {it.icon}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-[13px]">
          <ListMenu />
        </div>
      </div>
      <div className="text-center mt-[9px]">
        <small className="text-[0.75rem]">© 2022 uuki.dev</small>
      </div>
    </footer>
  )
})

export { Footer }
