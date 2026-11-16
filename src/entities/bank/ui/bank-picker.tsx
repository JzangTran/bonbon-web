import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { cn } from '@/shared/lib/utils'
import { t } from '@/shared/i18n'
import { findBank, fold, useBanks } from '../api'

/**
 * Choose a bank from the Napas list instead of typing its name, so a typo cannot make VietQR transfers to the shop unavailable. Search
 * matches the short name, the code or the full name without accents ("vcb", "ngoai thuong", "techcom" all work). The value is the short
 * name the backend stores.
 */
export function BankPicker({ id, value, onChange, invalid }: { id: string; value: string; onChange: (shortName: string) => void; invalid?: boolean }) {
  const { data: banks, isError } = useBanks()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const chosen = findBank(banks, value)
  const shown = useMemo(() => {
    const key = fold(query)
    if (!banks) return []
    return key ? banks.filter((b) => [b.shortName, b.code, b.name].some((x) => x && fold(x).includes(key))) : banks
  }, [banks, query])

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setQuery('') }}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          className="flex h-10 w-full items-center justify-between gap-2 rounded-lg bg-grey-100 px-3 text-left text-ui text-ink outline-none hover:bg-grey-200 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring aria-invalid:outline-2 aria-invalid:outline-destructive"
        >
          <span className={cn('truncate', !chosen && !value && 'text-muted-foreground')}>
            {chosen ? `${chosen.shortName} · ${chosen.name}` : value || t('Chọn ngân hàng')}
          </span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={60}
          placeholder={t('Tìm theo tên hoặc mã, ví dụ VCB')}
          aria-label={t('Tìm ngân hàng')}
          className="h-10 w-full border-b bg-transparent px-3 text-ui outline-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && shown.length > 0) {
              e.preventDefault()
              onChange(shown[0].shortName ?? '')
              setOpen(false)
            }
          }}
        />
        <ul role="listbox" aria-label={t('Ngân hàng')} className="max-h-72 overflow-y-auto py-1">
          {isError ? <li className="px-3 py-2 text-sm text-destructive">{t('Không tải được danh sách ngân hàng.')}</li> : null}
          {banks && shown.length === 0 ? <li className="px-3 py-2 text-sm text-muted-foreground">{t('Không có ngân hàng phù hợp.')}</li> : null}
          {shown.map((b) => {
            const selected = chosen?.bin === b.bin
            return (
              <li key={b.bin} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => { onChange(b.shortName ?? ''); setOpen(false) }}
                  className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-grey-100 focus-visible:bg-grey-100 focus-visible:outline-none"
                >
                  <CheckIcon className={cn('mt-0.5 size-4 shrink-0 text-primary', !selected && 'invisible')} />
                  <span>
                    <span className="font-medium">{b.shortName}</span> <span className="text-muted-foreground">({b.code})</span>
                    <span className="block text-xs text-muted-foreground">{b.name}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
