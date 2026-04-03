import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  itemLabel: string
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemLabel,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10],
}) => {
  if (totalItems <= 0) return null

  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)
  const pageItems = buildPageItems(currentPage, totalPages)

  const baseButtonClass =
    'inline-flex h-[42px] min-w-[42px] items-center justify-center rounded-[8px] border px-4 text-[12px] font-semibold font-serif transition-colors duration-200'
  const secondaryButtonClass =
    'border-[#E9D7CE] bg-white text-[#7A6455] hover:border-[#D8BAA5] hover:bg-[#FDF6F2]'
  const disabledButtonClass =
    'cursor-not-allowed border-[#EEDFD7] bg-[#F7F1ED] text-[#C7AFA0] hover:border-[#EEDFD7] hover:bg-[#F7F1ED]'

  return (
    <div className="border-t border-[#F0DDD5] bg-[#FFFCFA] px-5 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <p className="m-0 text-[12px] text-[#8D7B70] font-serif">
            Showing <span className="font-semibold text-[#4E3F35]">{start}-{end}</span> of{' '}
            <span className="font-semibold text-[#4E3F35]">{totalItems}</span> {itemLabel}
          </p>

          <span className="text-[12px] text-[#AE9484] font-serif">
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`${baseButtonClass} ${currentPage === 1 ? disabledButtonClass : secondaryButtonClass}`}
            aria-label="Previous page"
          >
            Prev
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {pageItems.map((item, index) => {
              if (item === 'ellipsis') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="inline-flex h-[42px] min-w-[24px] items-center justify-center px-1 text-[12px] font-semibold text-[#B29887]"
                  >
                    ...
                  </span>
                )
              }

              const isActive = currentPage === item
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`inline-flex h-[42px] min-w-[42px] items-center justify-center rounded-[8px] border px-4 text-[12px] font-semibold font-serif transition-colors duration-200 ${
                    isActive
                      ? 'border-[#C49A7A] bg-[#C49A7A] text-white'
                      : 'border-[#E9D7CE] bg-white text-[#7A6455] hover:border-[#D8BAA5] hover:bg-[#FDF6F2]'
                  }`}
                >
                  {item}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`${baseButtonClass} ${currentPage === totalPages ? disabledButtonClass : secondaryButtonClass}`}
            aria-label="Next page"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

function buildPageItems(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis', totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages]
}

export default Pagination
