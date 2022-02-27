import { memo } from 'react'
import { Link } from '@/components/atoms/Link'
import { BadgeOrigin } from '@/components/atoms/BadgeOrigin'
import { ListTag } from '@/components/molecules/ListTag'
import { ListMeta } from '@/components/molecules/ListMeta'
import { PostFrontMatter } from '@/types/Post'

export type CardProps = PostFrontMatter & {}

const Card = memo(({ slug, title, date, tags, origin, url }: CardProps) => {
  return (
    <article className="rounded-md bg-white shadow-theme px-[25px] py-[16px]">
      <div className="mb-[5px]">
        <BadgeOrigin name={origin} />
      </div>
      <h2 className="md:text-[23px] sm:text-[18px] font-bold mb-[7px]">
        <Link href={url || `/blog/${slug}`} className="inline-block link-opacity">
          {title}
        </Link>
      </h2>
      <div className="mb-[3px]">
        <ListTag tags={tags} />
      </div>
      <div>
        <ListMeta date={date} />
      </div>
    </article>
  )
})

export { Card }
