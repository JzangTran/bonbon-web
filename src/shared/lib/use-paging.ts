import { useState } from 'react'

/** The row counts a list offers; 25 is the default. */
export const PAGE_SIZES = [25, 50, 75] as const
export type PageSize = (typeof PAGE_SIZES)[number]

export type Paging = ReturnType<typeof usePaging>

/**
 * Which page of a list is shown and how many rows it has. Changing the row count goes back to the first page so the person never
 * lands past the end; so does `reset`, for a list whose filter changed.
 */
export function usePaging(initial: PageSize = 25) {
  const [page, setPage] = useState(0)
  const [size, setSizeState] = useState<PageSize>(initial)
  return {
    page,
    size,
    setPage,
    setSize: (next: PageSize) => {
      setSizeState(next)
      setPage(0)
    },
    reset: () => setPage(0),
  }
}
