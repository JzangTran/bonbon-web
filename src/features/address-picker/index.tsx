import { useQuery } from '@tanstack/react-query'
import { MapPinIcon } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { api, problemMessage } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

export type PickedAddress = { placeId: string; description: string }

/**
 * Address entry through Goong (address-and-geocoding.md): suggestions after ≥ 3 characters and a 300 ms pause,
 * fetched through the backend. Only a picked suggestion counts; free text alone cannot be saved.
 */
export function AddressPicker({
  label,
  current,
  onPick,
  invalid,
}: {
  label: string
  /** The address saved so far, shown until another one is picked. */
  current?: string
  onPick: (picked: PickedAddress) => void
  invalid?: boolean
}) {
  const id = useId()
  const [text, setText] = useState('')
  const [debounced, setDebounced] = useState('')
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(text.trim()), 300)
    return () => clearTimeout(timer)
  }, [text])

  const suggestions = useQuery({
    queryKey: ['geo', 'autocomplete', debounced],
    enabled: debounced.length >= 3,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/geo/autocomplete', { params: { query: { input: debounced } } })
      if (error || !data) throw error
      return data
    },
  })

  const shown = picked ?? current

  return (
    <div className="relative flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {shown ? (
        <p className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-sm">
          <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{shown}</span>
        </p>
      ) : null}
      <Input
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-invalid={invalid}
        autoComplete="off"
        placeholder={shown ? 'Tìm địa chỉ khác…' : 'Gõ ít nhất 3 ký tự, ví dụ tên toà nhà hoặc đường'}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && debounced.length >= 3 ? (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute top-full z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border bg-popover shadow-md"
        >
          {suggestions.isPending ? <li className="px-3 py-2 text-sm text-muted-foreground">Đang tìm…</li> : null}
          {suggestions.isError ? (
            <li className="px-3 py-2 text-sm text-danger-fg">{problemMessage(suggestions.error)}</li>
          ) : null}
          {suggestions.data?.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">Không tìm thấy địa chỉ phù hợp.</li>
          ) : null}
          {suggestions.data?.map((s) => (
            <li key={s.placeId} role="option" aria-selected={false}>
              <button
                type="button"
                className={cn('flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-muted')}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setPicked(s.description ?? s.mainText ?? '')
                  setText('')
                  setOpen(false)
                  onPick({ placeId: s.placeId!, description: s.description ?? '' })
                }}
              >
                <span className="font-medium">{s.mainText}</span>
                <span className="text-xs text-muted-foreground">{s.secondaryText}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
