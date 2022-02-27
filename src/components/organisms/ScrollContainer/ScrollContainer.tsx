import { ReactNode } from 'react'
import InfiniteScroll from 'react-infinite-scroller'

export type ScrollContainerProps = {
  pageStart?: number
  items: ReactNode
  loadMore: (page: number) => void
  hasMore: boolean
}

const ScrollContainer = ({ pageStart = 0, items, loadMore, hasMore }: ScrollContainerProps) => {
  return (
    <>
      <InfiniteScroll pageStart={pageStart} loadMore={loadMore} hasMore={hasMore}>
        {items}
      </InfiniteScroll>
    </>
  )
}

export { ScrollContainer }
