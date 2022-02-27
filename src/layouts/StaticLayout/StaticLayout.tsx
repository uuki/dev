import React, { ReactNode } from 'react'
import { Header } from '@/components/organisms/Header'
import { Footer } from '@/components/organisms/Footer'
import { PostHeader } from '@/components/atoms/PostHeader'
import { ListMeta } from '@/components/molecules/ListMeta'
import { PostStaticFrontMatter } from '@/types/Post'
import { PostRevision } from '@/types/Post'

interface StaticLayoutProps {
  children: ReactNode
  frontMatter: PostStaticFrontMatter
  history: PostRevision[]
}

const StaticLayout = ({ children, frontMatter, history }: StaticLayoutProps) => {
  const { title, description } = frontMatter

  return (
    <div className="bg-bg">
      <Header />
      <main>
        <div className="py-[60px]">
          <div className="px-content-narrow">
            <div className="mb-[95px]">
              <PostHeader>{title}</PostHeader>
              {history && history.length > 1 && (
                <div className="mt-[6px]">
                  <ListMeta history={history} />
                </div>
              )}
            </div>
            <div className="prose max-w-none bg-white md:px-[40px] md:py-[50px] sm:px-[20px] sm:py-[25] rounded-md">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export { StaticLayout }
