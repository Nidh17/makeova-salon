import type { PaginationMeta } from '@/types'

export const DEFAULT_PAGE_SIZE = 10
export const PAGE_SIZE_OPTIONS = [10]

export const createEmptyPagination = (perPage = DEFAULT_PAGE_SIZE): PaginationMeta => ({
  currentPage: 1,
  perPage,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
})
