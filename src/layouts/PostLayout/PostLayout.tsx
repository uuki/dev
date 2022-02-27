import React, { ReactNode } from 'react'
import { Header } from '@/components/organisms/Header'
import { Footer } from '@/components/organisms/Footer'
import { PostHeader } from '@/components/atoms/PostHeader'
import { ListMeta } from '@/components/molecules/ListMeta'
import { ListSocial } from '@/components/molecules/ListSocial'
import { PostRevision } from '@/types/Post'
import { PostFrontMatter } from '@/types/Post'
import { ReadingTimeResults } from '@/types/ReadingTime'

interface PostLayoutProps {
  children: ReactNode
  frontMatter: PostFrontMatter & { readingTime: ReadingTimeResults }
  history: PostRevision[]
}

const PostLayout = ({ children, frontMatter, history }: PostLayoutProps) => {
  const { date, slug, title, readingTime } = frontMatter

  return (
    <div className="bg-bg">
      <Header />
      <main>
        <article className="py-[60px]">
          <div className="px-content-narrow">
            <div className="md:mb-[95px] sm:mb-[46px]">
              <PostHeader>{title}</PostHeader>
              <div className="mt-[6px]">
                <ListMeta date={date} readingTime={readingTime} history={history} />
              </div>
            </div>
            <div className=" bg-white md:px-[40px] md:py-[50px] sm:px-[20px] sm:py-[25px] rounded-md">
              <div className="prose max-w-none">{children}</div>
              <div className="md:mt-[80px] md:pt-[40px] sm:mt-[40px] sm:pt-[25px] border-t-[1px] border-border text-center">
                <ListSocial pathname={`/blog/${slug}`} text={title} />
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  )
}

export { PostLayout }
