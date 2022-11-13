import type { PostStaticFrontMatter } from '#/post'
import React, { ReactNode } from 'react'
import { Link } from '@/components/atoms/Link'
import { Author } from '@/components/molecules/Author'
import { Header } from '@/components/organisms/Header'
import { Footer } from '@/components/organisms/Footer'
import { PageHeader } from '@/components/atoms/PageHeader'
import { SiTwitter, SiGithub } from 'react-icons/si'
import { HiOutlineMail } from 'react-icons/hi'
import config from '@/config/manage'

type AboutLayoutProps = {
  children: ReactNode
  frontMatter: PostStaticFrontMatter
}

const AboutLayout = ({ children, frontMatter }: AboutLayoutProps) => {
  const { title, description } = frontMatter
  const ContactItem = [
    {
      url: `https://twitter.com/${config.TWITTER}`,
      icon: <SiTwitter />,
    },
    {
      url: `https://github.com/${config.GITHUB}`,
      icon: <SiGithub />,
    },
    {
      url: `mailto:${config.EMAIL}`,
      icon: <HiOutlineMail className="text-[1.125rem]" />,
    },
  ]

  return (
    <div className="flex-container bg-bg">
      <Header />
      <main className="flex-1">
        <div className="py-[66px]">
          <div className="px-content-narrow">
            <div className="mb-[40px]">
              <div className="mb-[25px]">
                <PageHeader>{title}</PageHeader>
              </div>
              <div className="flex justify-center mb-[20px]">
                <Author />
              </div>
              <ul className="flex items-center justify-center">
                {ContactItem.map((it) => (
                  <li key={it.url} className="mx-[7px]">
                    <Link href={it.url}>{it.icon}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="prose max-w-none bg-white md:px-[40px] md:py-[50px] sm:px-[20px] sm:py-[25px] rounded-md">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export { AboutLayout }
