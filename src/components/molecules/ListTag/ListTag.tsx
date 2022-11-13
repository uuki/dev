import type { Tags } from '#/taxonomy'
import { Tag } from '@/components/atoms/Tag'

export type ListTagProps = Tags

const ListTag = ({ tags }: { tags: ListTagProps }) => {
  return (
    <ul className="flex flex-wrap">
      {tags.map((it) => (
        <li key={it} className="mr-[10px]">
          <Tag>{it}</Tag>
        </li>
      ))}
    </ul>
  )
}

export { ListTag }
