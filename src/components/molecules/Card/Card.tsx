import type { PostFrontMatter } from '#/post'
import React, { memo } from 'react'
import { Link } from '@/components/atoms/Link'
import { BadgeOrigin } from '@/components/atoms/BadgeOrigin'
import { ListTag } from '@/components/molecules/ListTag'
import { ListMeta } from '@/components/molecules/ListMeta'

export type CardProps = PostFrontMatter & {}

const Card = ({ slug, title, date, tags, origin, url }: CardProps) => {
  return (
    <article className="rounded-md bg-white shadow-theme px-[25px] py-[16px]">
      <div className="mb-[5px]">
        <BadgeOrigin name={origin} />
      </div>
      <h2 className="md:text-[21px] sm:text-[18px] font-bold mb-[7px]">
        <Link href={url || `/blog/${slug}`} className="inline-block link-opacity">
          {title}
        </Link>
      </h2>
      <div className="mb-[7px]">
        <ListTag tags={tags} />
      </div>
      <div>
        <ListMeta date={date} />
      </div>
    </article>
  )
}

export default memo(Card)
