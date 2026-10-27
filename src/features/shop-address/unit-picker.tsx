import { CheckIcon, ChevronDownIcon, SearchIcon } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { useProvinces, useWards } from '@/entities/geo'
import { problemMessage } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

type Tab = 'province' | 'ward'

/** Lower case without accents, to search names the way people type them. */
function plain(text: string) {
  return text.normalize('NFD').replace(/\p{M}+/gu, '').replace(/đ/g, 'd').toLowerCase()
}

/**
 * One select for two levels: the button shows "Phường/Xã, Tỉnh/Thành phố" and opens a panel under it with two tabs, the
 * provinces and the wards of the chosen province. Choosing a province moves to the wards; choosing a ward closes the panel.
 */
export function UnitPicker({
  id,
  provinceCode,
  wardCode,
  onChange,
  invalid,
  describedBy,
}: {
  id: string
  provinceCode?: number
  wardCode?: number
  onChange: (provinceCode: number | undefined, wardCode: number | undefined) => void
  invalid?: boolean
  describedBy?: string
}) {
  const provinces = useProvinces()
  const wards = useWards(provinceCode)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('province')
  const [query, setQuery] = useState('')
  const listId = useId()

  const province = provinces.data?.find((p) => p.code === provinceCode)
  const ward = wards.data?.find((w) => w.code === wardCode)
  const label = [ward?.name, province?.name].filter(Boolean).join(', ')

  const items = useMemo(() => {
    const source = tab === 'province' ? (provinces.data ?? []) : (wards.data ?? [])
    const q = plain(query.trim())
    return q ? source.filter((x) => plain(x.name).includes(q)) : source
  }, [tab, query, provinces.data, wards.data])

  const choose = (code: number) => {
    if (tab === 'province') {
      // A different province drops the ward (it belongs to the old one).
      onChange(code, code === provinceCode ? wardCode : undefined)
      setTab('ward')
      setQuery('')
    } else {
      onChange(provinceCode, code)
      setOpen(false)
    }
  }
  const selected = tab === 'province' ? provinceCode : wardCode

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setTab(provinceCode === undefined ? 'province' : 'ward')
          setQuery('')
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          className="flex h-10 w-full items-center justify-between gap-2 rounded-lg bg-grey-100 hover:bg-grey-200/70 px-3 text-left text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive md:text-sm"
        >
          <span className={cn('truncate', !label && 'text-muted-foreground')}>{label || 'Chọn Tỉnh/Thành phố, Phường/Xã'}</span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-[18rem]">
        <div role="tablist" aria-label="Cấp hành chính" className="flex border-b">
          {(
            [
              ['province', 'Tỉnh/Thành phố'],
              ['ward', 'Phường/Xã'],
            ] as const
          ).map(([value, text]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              disabled={value === 'ward' && provinceCode === undefined}
              onClick={() => {
                setTab(value)
                setQuery('')
              }}
              className={cn(
                'h-10 flex-1 border-b-2 border-transparent px-3 text-[0.8125rem] outline-none focus-visible:bg-ws-fill disabled:cursor-not-allowed disabled:text-muted-foreground',
                tab === value && 'border-primary font-semibold',
              )}
            >
              {text}
            </button>
          ))}
        </div>
        <div className="relative border-b">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            aria-label={tab === 'province' ? 'Tìm Tỉnh/Thành phố' : 'Tìm Phường/Xã'}
            placeholder={tab === 'province' ? 'Tìm Tỉnh/Thành phố' : 'Tìm Phường/Xã'}
            value={query}
            maxLength={60}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full bg-transparent pr-3 pl-9 text-sm outline-none"
          />
        </div>
        <ul id={listId} role="listbox" aria-label={tab === 'province' ? 'Tỉnh/Thành phố' : 'Phường/Xã'} className="max-h-64 overflow-y-auto py-1">
          {(tab === 'province' ? provinces : wards).isPending ? <li className="px-3 py-2 text-sm text-muted-foreground">Đang tải…</li> : null}
          {(tab === 'province' ? provinces : wards).isError ? (
            <li className="px-3 py-2 text-sm text-destructive">{problemMessage((tab === 'province' ? provinces : wards).error)}</li>
          ) : null}
          {items.length === 0 && !(tab === 'province' ? provinces : wards).isPending && !(tab === 'province' ? provinces : wards).isError ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">Không có kết quả.</li>
          ) : null}
          {items.map((item) => (
            <li key={item.code} role="option" aria-selected={item.code === selected}>
              <button
                type="button"
                onClick={() => choose(item.code)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm outline-none hover:bg-ws-fill focus-visible:bg-ws-fill"
              >
                <span>{item.name}</span>
                {item.code === selected ? <CheckIcon className="size-4 text-primary" aria-hidden="true" /> : null}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
