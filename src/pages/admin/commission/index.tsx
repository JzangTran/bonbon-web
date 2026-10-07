import { useState } from 'react'
import { useCommissionHistory, useCommissionRates, useSetCommissionRate, type CategoryCommissionRate } from '@/entities/settlement'
import { useSession } from '@/entities/session'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

const percent = (rate: number | undefined | null) => (rate === undefined || rate === null ? '—' : `${rate.toLocaleString('vi-VN')}%`)

type Target = { categoryId: string | null; name: string; current: number | null }

/** The commission the platform charges: a default, a rate on any category that its children inherit, and the history. */
export function AdminCommissionPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('commission:write')
  const rates = useCommissionRates(allowed)
  const [page, setPage] = useState(0)
  const history = useCommissionHistory(page, allowed)
  const save = useSetCommissionRate()
  const [target, setTarget] = useState<Target | null>(null)
  const [text, setText] = useState('')
  const data = rates.data

  if (!allowed) return <p className="text-muted-foreground">Bạn không có quyền đặt tỷ lệ hoa hồng.</p>

  const open = (next: Target) => {
    setTarget(next)
    setText(next.current === null ? '' : String(next.current).replace('.', ','))
  }
  const parsed = Number(text.trim().replace(',', '.'))
  const valid = text.trim() !== '' && Number.isFinite(parsed) && parsed >= 0 && parsed <= (data?.maxRate ?? 30) && /^\d{1,2}([.,]\d{1,2})?$/.test(text.trim())
  const net = data?.vatPercent !== undefined && valid ? parsed / (1 + (data.vatPercent ?? 0) / 100) : null

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Hoa hồng</h1>
        <p className="text-sm text-muted-foreground">
          Tỷ lệ đã gồm VAT {data?.vatPercent ?? 8}%. Tỷ lệ mới chỉ áp dụng cho đơn đặt sau khi lưu; đơn đã đặt giữ tỷ lệ cũ.
        </p>
      </div>
      {rates.isError ? <FormError message={problemMessage(rates.error)} /> : null}
      {rates.isPending ? <Skeleton className="h-32" /> : null}

      {data ? (
        <>
          <Card className="flex-row flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Tỷ lệ mặc định (ngành không có tỷ lệ riêng)</p>
              <p className="text-3xl font-semibold tabular-nums">{percent(data.defaultRate)}</p>
              <p className="text-xs text-muted-foreground">
                Phần ròng {percent(Math.round(((data.defaultRate ?? 0) / (1 + (data.vatPercent ?? 0) / 100)) * 100) / 100)} + VAT
              </p>
            </div>
            <Button onClick={() => open({ categoryId: null, name: 'Tỷ lệ mặc định', current: data.defaultRate ?? null })}>Đổi tỷ lệ mặc định</Button>
          </Card>

          <Card className="gap-0 overflow-hidden p-0">
            <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_8rem_auto] gap-3 border-b bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
              <span>Ngành</span>
              <span className="text-right">Riêng</span>
              <span className="text-right">Đang áp dụng</span>
              <span className="w-40" />
            </div>
            <ul>
              {(data.categories ?? []).map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  busy={save.isPending}
                  onEdit={() => open({ categoryId: category.id ?? null, name: category.name ?? '', current: category.ownRate ?? category.effectiveRate ?? null })}
                  onClear={() => save.mutate({ categoryId: category.id ?? null, rate: null })}
                />
              ))}
            </ul>
          </Card>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">Lịch sử thay đổi</h2>
            {history.isError ? <FormError message={problemMessage(history.error)} /> : null}
            {history.data && (history.data.items ?? []).length === 0 ? <p className="text-sm text-muted-foreground">Chưa có thay đổi nào.</p> : null}
            <ul className="flex flex-col divide-y rounded-sm border bg-card">
              {(history.data?.items ?? []).map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
                  <span>
                    <b>{row.scope === 'DEFAULT' ? 'Mặc định' : row.categoryName}</b>:{' '}
                    {row.previousRate === undefined ? 'chưa có' : percent(row.previousRate)} → {row.rate === undefined ? 'kế thừa' : percent(row.rate)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(row.effectiveFrom)} · {row.actedByType === 'SYSTEM' ? 'hệ thống' : 'quản trị viên'}
                  </span>
                </li>
              ))}
            </ul>
            {(history.data?.total ?? 0) > (history.data?.size ?? 10) ? (
              <div className="flex items-center justify-between">
                <Button variant="outline" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  Trang trước
                </Button>
                <Button variant="outline" disabled={(page + 1) * (history.data?.size ?? 10) >= (history.data?.total ?? 0)} onClick={() => setPage(page + 1)}>
                  Trang sau
                </Button>
              </div>
            ) : null}
          </section>
        </>
      ) : null}

      <Dialog open={target !== null} onOpenChange={(next) => (next ? undefined : setTarget(null))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{target?.name}</DialogTitle>
            <DialogDescription>
              {target?.categoryId ? 'Các ngành con chưa có tỷ lệ riêng sẽ dùng tỷ lệ này.' : 'Dùng cho mọi ngành không có tỷ lệ riêng và không có ngành cha nào có.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="rate">Tỷ lệ hoa hồng (%), từ 0 đến {data?.maxRate ?? 30}</Label>
            <Input id="rate" inputMode="decimal" value={text} onChange={(e) => setText(e.target.value)} placeholder="10" />
            {net !== null ? <p className="text-xs text-muted-foreground">Phần ròng {percent(Math.round(net * 100) / 100)}, còn lại là VAT.</p> : null}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Huỷ</Button>
            </DialogClose>
            <Button
              disabled={!valid || save.isPending}
              onClick={() => {
                if (target) save.mutate({ categoryId: target.categoryId, rate: parsed }, { onSuccess: () => setTarget(null) })
              }}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CategoryRow({ category, busy, onEdit, onClear }: { category: CategoryCommissionRate; busy: boolean; onEdit: () => void; onClear: () => void }) {
  const level = category.level ?? 1
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_5.5rem_8rem_auto] items-center gap-3 border-b px-4 py-2 text-sm last:border-b-0">
      <span className="min-w-0 truncate" style={{ paddingLeft: `${(level - 1) * 1.25}rem` }}>
        {category.name}
        {category.active === false ? <Badge variant="outline" className="ml-2">Ẩn</Badge> : null}
      </span>
      <span className="text-right tabular-nums">{category.ownRate !== undefined ? percent(category.ownRate) : '—'}</span>
      <span className="text-right tabular-nums">
        {percent(category.effectiveRate)}
        <span className="block text-xs text-muted-foreground">
          {category.source === 'OWN' ? 'riêng' : category.source === 'ANCESTOR' ? `từ ${category.sourceName}` : 'mặc định'}
        </span>
      </span>
      <span className="flex w-40 justify-end gap-1">
        <Button size="sm" variant="outline" onClick={onEdit}>
          Sửa
        </Button>
        {category.ownRate !== undefined ? (
          <Button size="sm" variant="ghost" disabled={busy} onClick={onClear}>
            Kế thừa
          </Button>
        ) : null}
      </span>
    </li>
  )
}
