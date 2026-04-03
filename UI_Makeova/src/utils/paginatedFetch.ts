import type { PaginatedData } from '@/types'

export async function fetchAllPaginatedItems<T>(
  fetchPage: (page: number, limit: number) => Promise<PaginatedData<T>>,
  limit = 100,
): Promise<T[]> {
  const firstPage = await fetchPage(1, limit)
  const allItems = [...firstPage.items]
  const totalPages = Math.max(1, firstPage.pagination.totalPages || 1)

  if (totalPages === 1) {
    return allItems
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => fetchPage(index + 2, limit)),
  )

  remainingPages.forEach(page => {
    allItems.push(...page.items)
  })

  return allItems
}
