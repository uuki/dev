import { MdOutlineHistory } from 'react-icons/md'
import { AiOutlineEdit, AiOutlineRead } from 'react-icons/ai'
import { PostDate } from '@/components/atoms/PostDate'
import { PostHistory } from '@/components/atoms/PostHistory'
import { PostRevision } from '@/types/Post'
import { ReadingTimeResults } from '@/types/ReadingTime'

export type ListMetaProps = {
  date?: string
  readingTime?: ReadingTimeResults
  history?: PostRevision[]
}

const ListMeta = ({ date, readingTime, history }: ListMetaProps) => {
  const styleItem = [
    'flex',
    'items-center',
    'text-[0.75rem]',
    'font-bold',
    'text-meta',
    'mr-[10px]',
    'after:content-["|"]',
    'after:ml-[10px]',
    'last:after:hidden',
    'after:text-border',
  ].join(' ')
  const styleIconBase = ['text-[0.875rem]', 'mt-[-2px]', 'mr-[5px]'].join(' ')

  return (
    <ul className="flex flex-wrap">
      {date && (
        <li className={styleItem}>
          <AiOutlineEdit className={styleIconBase} />
          <PostDate date={date} />
        </li>
      )}
      {readingTime && (
        <li className={styleItem}>
          <AiOutlineRead className={`${styleIconBase} text-[0.9375rem] mt-[0]`} />
          {Math.round(readingTime.minutes)} min read
        </li>
      )}
      {history && history.length > 1 && (
        <li className={styleItem}>
          <MdOutlineHistory className={`${styleIconBase} text-[1rem]`} />
          <PostHistory history={history} />
        </li>
      )}
    </ul>
  )
}

export { ListMeta }
