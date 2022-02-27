import { useRouter } from 'next/router'
import { HiArrowNarrowLeft, HiArrowNarrowRight } from 'react-icons/hi'
import { ButtonNav } from '@/components/atoms/ButtonNav'

export type PaginationProps = {
  currentPage: number
  totalPages: number
}

const Pagination = ({ currentPage, totalPages }: PaginationProps) => {
  const router = useRouter()

  const handlePaging = (page: number) => (event: React.MouseEvent<HTMLButtonElement>) => {
    router.push({
      query: {
        ...router.query,
        page,
      },
    })
  }

  const stylePagiButtonBase = ['relative', 'group'].join(' ')
  const styleIconBase = [
    'absolute',
    'top-1/2',
    'translate-y-[-50%]',
    'translate-x-[-10px]',
    'opacity-0',
    'transition-button',
    'group-hover:opacity-100',
  ].join(' ')

  return (
    <div className="mt-[40px]">
      <nav className="flex items-center justify-between">
        <ButtonNav
          disabled={currentPage === 1}
          onClick={handlePaging(currentPage - 1)}
          className={`${stylePagiButtonBase}${currentPage === 1 ? ' opacity-20 pointer-events-none' : ''}`}
        >
          <HiArrowNarrowLeft
            className={`${styleIconBase} left-[5px] translate-x-[10px] group-hover:translate-x-[5px]`}
          />
          Prev
        </ButtonNav>

        <span className="text-meta text-[0.875rem] font-[600]">
          {currentPage}
          <span className="text-[0.75rem] mx-[3px]">of</span>
          {totalPages}
        </span>

        <ButtonNav
          disabled={currentPage === totalPages}
          onClick={handlePaging(currentPage + 1)}
          className={`${stylePagiButtonBase}${currentPage === totalPages ? ' opacity-20 pointer-events-none' : ''}`}
        >
          Next
          <HiArrowNarrowRight
            className={`${styleIconBase} right-[5px] translate-x-[-10px] group-hover:translate-x-[-5px]`}
          />
        </ButtonNav>
      </nav>
    </div>
  )
}

export { Pagination }
