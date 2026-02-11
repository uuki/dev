import React from 'react'
import { Header } from '@/components/organisms/Header'
import { Footer } from '@/components/organisms/Footer'
import { LinkTag } from '@/components/atoms/LinkTag'
import { PageHeader } from '@/components/atoms/PageHeader'

export type TagsLayoutProps = {
  tags: Record<string, number>
}

const TagsLayout = ({ tags }: TagsLayoutProps) => {
  const sortedTags = Object.keys(tags).sort((a, b) => tags[b] - tags[a])

  return (
    <div className="flex-container bg-bg">
      <Header />
      <main className="flex items-center justify-center">
        <div className="py-[66px]">
          <div className="px-content-narrow">
            <div className="md:flex md:items-center">
              <div className="md:border-r-[2px] sm:border-b-[2px] md:pr-[20px] md:mr-[20px] sm:pb-[13px] sm:mb-[17px]">
                <PageHeader>Tags</PageHeader>
              </div>

              <ul className="flex max-w-lg flex-wrap mt-[-10px]">
                {sortedTags.map((tag) => (
                  <li key={tag} className="mt-[10px] mr-[20px]">
                    <LinkTag>{tag}</LinkTag>
                    <span className="text-[0.75rem] text-meta ml-[5px] align-[1px]">({tags[tag]})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export { TagsLayout }
