import { ReactNode } from 'react'
import { format } from 'date-fns'
import { Link } from '@/components/atoms/Link'
import { PostRevision } from '@/types/Post'
import configManage from '@/config/manage'

export type PostHistoryProps = { history: PostRevision[] }

const PostHistoryItem = ({
  history,
  index,
  children,
}: {
  history: PostRevision[]
  index: number
  children: ReactNode
}) => {
  const hash = history[index].hash
  const styleItem = ['px-[15px]', 'py-[10px]'].join(' ')
  const styleLink = ['block', 'link-opacity'].join(' ')

  return (
    <>
      {index < history.length - 1 ? (
        <Link
          href={`${configManage.github_rep_url.replace(/\/$/, '')}/compare/${hash}..${history[index + 1].hash}`}
          className={`${styleLink} ${styleItem}`}
        >
          <>{children}</>
        </Link>
      ) : (
        <div className={styleItem}>{children}</div>
      )}
    </>
  )
}

const PostHistory = ({ history }: PostHistoryProps) => {
  return (
    <details className="details-reset details-overlay">
      <summary className="flex items-center details-reset cursor-pointer dropdown-toggler">編集履歴</summary>
      <div className="absolute w-[200px] left-1/2 translate-y-[5px] translate-x-[-50%] shadow-tooltip rounded-md overflow-hidden">
        <div className="max-h-[154px] overflow-y-scroll">
          <ul className="bg-gray text-[0.6875rem]">
            {history.map((it, index) => (
              <li key={it.hash} className="border-t-[1px] first:border-t-0 border-border">
                <PostHistoryItem history={history} index={index}>
                  <div className="flex items-start">
                    <span>{it.hash}</span>
                    <span className="before:align-[2px] before:inline-block before:w-[3px] before:h-[3px] before:rounded-full before:bg-border before:mx-1.5">
                      {format(new Date(it.authorDate), 'dd MMM yyyy')}
                      {index >= history.length - 1 && ' (Initial commit)'}
                    </span>
                  </div>
                </PostHistoryItem>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  )
}

export { PostHistory }
