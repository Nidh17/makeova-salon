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
  variant?: 'admin' | 'receptionist' | 'staff'
}

const PAGINATION_THEME = {
  admin: {
    wrapper: 'border-[#F0DDD5] bg-[#FFFCFA]',
    bodyText: 'text-[#8D7B70]',
    bodyStrong: 'text-[#4E3F35]',
    pageText: 'text-[#AE9484]',
    secondary: 'border-[#E9D7CE] bg-white text-[#7A6455] hover:border-[#D8BAA5] hover:bg-[#FDF6F2]',
    disabled: 'border-[#EEDFD7] bg-[#F7F1ED] text-[#C7AFA0] hover:border-[#EEDFD7] hover:bg-[#F7F1ED]',
    active: 'border-[#C49A7A] bg-[#C49A7A] text-white',
    ellipsis: 'text-[#B29887]',
  },
  receptionist: {
    wrapper: 'border-[#E3CFD8] bg-[#FFF9FC]',
    bodyText: 'text-[#7F6670]',
    bodyStrong: 'text-[#3E2B34]',
    pageText: 'text-[#A18391]',
    secondary: 'border-[#E3CFD8] bg-white text-[#7E6070] hover:border-[#CFA7B8] hover:bg-[#FAF1F5]',
    disabled: 'border-[#EADCE2] bg-[#F8F1F4] text-[#C5AFB8] hover:border-[#EADCE2] hover:bg-[#F8F1F4]',
    active: 'border-[#9B5C74] bg-[#9B5C74] text-white',
    ellipsis: 'text-[#B0919E]',
  },
  staff: {
    wrapper: 'border-[#C8E6C9] bg-[#FBFEFB]',
    bodyText: 'text-[#6B806E]',
    bodyStrong: 'text-[#28412E]',
    pageText: 'text-[#8AA08D]',
    secondary: 'border-[#D4E8D6] bg-white text-[#5D7963] hover:border-[#9BC8A5] hover:bg-[#F1F8F2]',
    disabled: 'border-[#E0ECE2] bg-[#F4F8F4] text-[#B2C2B5] hover:border-[#E0ECE2] hover:bg-[#F4F8F4]',
    active: 'border-[#7AC49A] bg-[#7AC49A] text-white',
    ellipsis: 'text-[#8EA891]',
  },
} as const

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemLabel,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10],
  variant = 'admin',
}) => {
  if (totalItems <= 0) return null

  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)
  const pageItems = buildPageItems(currentPage, totalPages)
  const theme = PAGINATION_THEME[variant]

  const baseButtonClass =
    'inline-flex h-[42px] min-w-[42px] items-center justify-center rounded-[8px] border px-4 text-[12px] font-semibold font-serif transition-colors duration-200'
  const secondaryButtonClass = theme.secondary
  const disabledButtonClass = `cursor-not-allowed ${theme.disabled}`

  return (
    <div className={`border-t px-5 py-5 ${theme.wrapper}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <p className={`m-0 text-[12px] font-serif ${theme.bodyText}`}>
            Showing <span className={`font-semibold ${theme.bodyStrong}`}>{start}-{end}</span> of{' '}
            <span className={`font-semibold ${theme.bodyStrong}`}>{totalItems}</span> {itemLabel}
          </p>

          <span className={`text-[12px] font-serif ${theme.pageText}`}>
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
                    className={`inline-flex h-[42px] min-w-[24px] items-center justify-center px-1 text-[12px] font-semibold ${theme.ellipsis}`}
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
                      ? theme.active
                      : theme.secondary
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
