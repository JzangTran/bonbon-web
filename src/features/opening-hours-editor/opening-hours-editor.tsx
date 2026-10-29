import { t } from '@/shared/i18n'
import { CopyIcon, PlusIcon, XIcon } from 'lucide-react'
import { WEEKDAYS } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import type { OpeningWindow } from './model'

const MAX_PER_DAY = 4

/**
 * The weekly schedule (edit-store-info.md): up to 4 windows a day, Vietnam time. A window that closes earlier
 * than it opens runs past midnight and belongs to the day it starts on. The backend rejects overlaps.
 */
export function OpeningHoursEditor({ value, onChange }: { value: OpeningWindow[]; onChange: (next: OpeningWindow[]) => void }) {
  const byDay = (day: number) => value.map((w, i) => ({ w, i })).filter(({ w }) => w.weekday === day)
  const update = (index: number, patch: Partial<OpeningWindow>) =>
    onChange(value.map((w, i) => (i === index ? { ...w, ...patch } : w)))
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index))
  const add = (day: number) => onChange([...value, { weekday: day, opensAt: '06:00', closesAt: '21:00' }])
  const copyToAll = (day: number) => {
    const template = value.filter((w) => w.weekday === day)
    onChange([1, 2, 3, 4, 5, 6, 7].flatMap((d) => template.map((w) => ({ ...w, weekday: d }))))
  }

  return (
    <div className="flex flex-col divide-y rounded-sm border">
      {WEEKDAYS.map((name, idx) => {
        const day = idx + 1
        const windows = byDay(day)
        return (
          <div key={day} className="flex flex-wrap items-center gap-2 px-3 py-2">
            <span className="w-full shrink-0 text-sm font-medium sm:w-20">{name}</span>
            {windows.length === 0 ? <span className="text-sm text-muted-foreground">{t('Nghỉ')}</span> : null}
            {windows.map(({ w, i }) => (
              <span key={i} className="flex max-w-full flex-wrap items-center gap-1 rounded-md bg-muted px-2 py-1">
                <Input
                  type="time"
                  aria-label={t('{v0} mở cửa', { v0: name })}
                  className="h-8 w-36"
                  value={w.opensAt}
                  onChange={(e) => update(i, { opensAt: e.target.value })}
                />
                <span aria-hidden="true">–</span>
                <Input
                  type="time"
                  aria-label={t('{v0} đóng cửa', { v0: name })}
                  className="h-8 w-36"
                  value={w.closesAt}
                  onChange={(e) => update(i, { closesAt: e.target.value })}
                />
                {w.closesAt < w.opensAt ? <span className="text-xs text-muted-foreground">{t('(qua đêm)')}</span> : null}
                <Button type="button" variant="ghost" size="icon-sm" aria-label={t('Xoá khung giờ {v0}', { v0: name })} onClick={() => remove(i)}>
                  <XIcon />
                </Button>
              </span>
            ))}
            <div className="ml-auto flex gap-1">
              {windows.length < MAX_PER_DAY ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => add(day)}>
                  <PlusIcon />{t(' Thêm khung')}
                </Button>
              ) : null}
              {windows.length > 0 ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => copyToAll(day)} title={t('Áp dụng lịch ngày này cho cả tuần')}>
                  <CopyIcon />{t(' Cả tuần')}
                </Button>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
