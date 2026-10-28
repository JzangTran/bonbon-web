import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react'
import { useId } from 'react'
import { PAGE_SIZES, type PageSize, type Paging } from '@/shared/lib/use-paging'
import { cn } from '@/shared/lib/utils'

/** The page numbers around the current one, with gaps: 1 … 4 5 6 … 12. Zero-based in, zero-based out. */
function pageWindow(page: number, pages: number): (number | 'gap')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i)
  const set = new Set([0, pages - 1, page - 1, page, page + 1].filter((p) => p >= 0 && p < pages))
  const sorted = [...set].sort((a, b) => a - b)
  const out: (number | 'gap')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('gap')
    out.push(p)
  })
  return out
}

const square =
  'flex size-8 items-center justify-center rounded-md text-ui tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-35'

/**
 * Under every list: which rows are shown out of how many, how many rows a page (25, 50 or 75), and the page buttons (first,
 * previous, numbers, next, last). The current page is orange text, as a selected item is everywhere else.
 */
export function Pagination({ paging, total, className }: { paging: Paging; total: number; className?: string }) {
  const id = useId()
  const { page, size, setPage, setSize } = paging
  const pages = Math.max(1, Math.ceil(total / size))
  const from = total === 0 ? 0 : page * size + 1
  const to = Math.min(total, (page + 1) * size)
  if (total === 0) return null
  return (
    <nav aria-label="Phân trang" className={cn('flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-ui text-muted-foreground', className)}>
      <div className="flex items-center gap-4">
        <span className="tabular-nums">
          {from}–{to} trên {total.toLocaleString('vi-VN')}
        </span>
        <span className="flex items-center gap-2">
          <label htmlFor={id}>Số dòng</label>
          <select
            id={id}
            value={size}
            onChange={(e) => setSize(Number(e.target.value) as PageSize)}
            className="h-8 rounded-md bg-grey-100 px-2 text-ui text-ink outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </span>
      </div>
      {pages > 1 ? (
        <div className="flex items-center gap-0.5">
          <button type="button" className={cn(square, 'hover:bg-grey-100')} aria-label="Trang đầu" disabled={page === 0} onClick={() => setPage(0)}>
            <ChevronsLeftIcon className="size-4" />
          </button>
          <button type="button" className={cn(square, 'hover:bg-grey-100')} aria-label="Trang trước" disabled={page === 0} onClick={() => setPage(page - 1)}>
            <ChevronLeftIcon className="size-4" />
          </button>
          {pageWindow(page, pages).map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} aria-hidden="true" className="w-6 text-center">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                aria-label={`Trang ${p + 1}`}
                aria-current={p === page ? 'page' : undefined}
                onClick={() => setPage(p)}
                className={cn(square, 'min-w-8 px-1.5', 'hover:bg-grey-100 hover:text-ink',
                  p === page ? 'font-medium text-primary' : 'text-muted-foreground')}
              >
                {p + 1}
              </button>
            ),
          )}
          <button type="button" className={cn(square, 'hover:bg-grey-100')} aria-label="Trang sau" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>
            <ChevronRightIcon className="size-4" />
          </button>
          <button type="button" className={cn(square, 'hover:bg-grey-100')} aria-label="Trang cuối" disabled={page >= pages - 1} onClick={() => setPage(pages - 1)}>
            <ChevronsRightIcon className="size-4" />
          </button>
        </div>
      ) : null}
    </nav>
  )
}
