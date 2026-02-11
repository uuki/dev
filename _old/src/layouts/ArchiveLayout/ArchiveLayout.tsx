import type { PostFrontMatter } from '#/post'
import React, { ComponentProps, useState } from 'react'
import { Header } from '@/components/organisms/Header'
import { Footer } from '@/components/organisms/Footer'
import { Pagination } from '@/components/molecules/Pagination'
import { Card } from '@/components/molecules/Card'
import { InputText } from '@/components/atoms/InputText'
import { PageHeader } from '@/components/atoms/PageHeader'

export type ArchiveLayoutProps = {
  title: string
  initialDisplayPosts?: PostFrontMatter[]
  pagination?: ComponentProps<typeof Pagination>
  posts: PostFrontMatter[]
}

const ArchiveLayout = ({ initialDisplayPosts = [], pagination, posts, title }: ArchiveLayoutProps) => {
  const [searchValue, setSearchValue] = useState('')
  const filteredBlogPosts = posts.filter((frontMatter) => {
    return [frontMatter.title, frontMatter.description, ...frontMatter.tags]
      .join(' ')
      .toLowerCase()
      .includes(searchValue.toLowerCase())
  })

  // If initialDisplayPosts exist, display it if no searchValue is specified
  const displayPosts = initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredBlogPosts

  return (
    <div className="flex-container bg-bg">
      <Header />
      <main className="flex-1">
        <div className="py-[66px]">
          <div className="px-content-narrow">
            <div className="mb-[23px]">
              <PageHeader>{title}</PageHeader>
            </div>

            <div className="md:mb-[30px] sm:mb-[20px] sm:flex sm:justify-center">
              <InputText
                aria-label="Search articles"
                className="block w-full max-w-[60%] shadow-theme"
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search articles"
              />
            </div>

            <ul className="flex md:flex-wrap md:gap-[30px] sm:flex-col sm:gap-[20px]">
              {displayPosts.map((post) => (
                <li key={post.slug} className="md:w-[calc(50%-15px)]">
                  <div className="flex h-full">
                    <Card {...post} />
                  </div>
                </li>
              ))}
            </ul>

            {pagination && pagination.totalPages > 1 && !searchValue && (
              <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export { ArchiveLayout }
