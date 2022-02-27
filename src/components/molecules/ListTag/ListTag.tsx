import { Tags } from '@/types/Tag'

export type ListTagProps = Tags

const ListTag = ({ tags }: { tags: ListTagProps }) => {
  return (
    <ul className="flex flex-wrap text-[0.75rem] font-bold text-meta">
      {tags.map((it) => (
        <li key={it} className="list-delimiter-comma mr-[5px]">
          {it}
        </li>
      ))}
    </ul>
  )
}

export { ListTag }
