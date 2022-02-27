import { format, parseISO } from 'date-fns'
import { formatSince } from '@/utils/formatDate'

type PostDateProps = {
  date: string
}

const PostDate = ({ date }: PostDateProps) => {
  const utcDate: Date = parseISO(date)
  const sinceDate = formatSince(utcDate)

  return <time dateTime={format(utcDate, 'yyyy-MM-dd')}>{sinceDate}</time>
}

export { PostDate }
