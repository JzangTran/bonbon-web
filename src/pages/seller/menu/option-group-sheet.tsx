import { PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { useOptionMutation, type OptionGroup } from '@/entities/menu'
import { api, problemMessage, type components } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { FormError } from '@/widgets/auth-shell'

type Row = { key: number; id?: string; name: string; priceDelta: string; defaultChoice: boolean; soldOut: boolean }

function toInt(text: string): number | undefined {
  const cleaned = text.trim().replace(/\./g, '')
  return cleaned === '' ? 0 : /^\d+$/.test(cleaned) ? Number(cleaned) : undefined
}

/** Create or replace one option group: its rules and its options (options left out are retired). */
export function OptionGroupSheet({ group, onClose }: { group: OptionGroup | null; onClose: () => void }) {
  const [name, setName] = useState(group?.name ?? '')
  const [min, setMin] = useState(String(group?.min ?? 0))
  const [max, setMax] = useState(String(group?.max ?? 1))
  const [nextKey, setNextKey] = useState(100)
  const [rows, setRows] = useState<Row[]>(
    (group?.options ?? []).length > 0
      ? (group?.options ?? []).map((o, i) => ({
          key: i,
          id: o.id,
          name: o.name ?? '',
          priceDelta: String(o.priceDelta ?? 0),
          defaultChoice: Boolean(o.defaultChoice),
          soldOut: o.status === 'SOLD_OUT',
        }))
      : [{ key: 0, name: '', priceDelta: '0', defaultChoice: false, soldOut: false }],
  )
  const [error, setError] = useState<string | null>(null)

  const save = useOptionMutation((body: components['schemas']['OptionGroupRequest']) =>
    group
      ? api.PUT('/api/merchant/option-groups/{id}', { params: { path: { id: group.id! } }, body })
      : api.POST('/api/merchant/option-groups', { body }),
    group ? 'Đã lưu nhóm lựa chọn.' : 'Đã thêm nhóm lựa chọn.',
  )

  const update = (key: number, patch: Partial<Row>) => setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))

  function submit() {
    const minValue = Number(min)
    const maxValue = Number(max)
    const options = rows.map((r) => ({ ...r, delta: toInt(r.priceDelta) }))
    if (options.some((o) => o.delta === undefined)) return setError('Giá cộng thêm phải là số nguyên không âm.')
    if (!Number.isInteger(minValue) || !Number.isInteger(maxValue) || minValue < 0 || maxValue < 1) {
      return setError('Số lựa chọn tối thiểu từ 0, tối đa từ 1.')
    }
    if (minValue > maxValue) return setError('Tối thiểu không được lớn hơn tối đa.')
    if (maxValue > options.length) return setError('Tối đa không được vượt quá số lựa chọn bạn có.')
    setError(null)
    save.mutate(
      {
        name: name.trim(),
        min: minValue,
        max: maxValue,
        options: options.map((o) => ({
          ...(o.id ? { id: o.id } : {}),
          name: o.name.trim(),
          priceDelta: o.delta!,
          defaultChoice: o.defaultChoice,
          status: o.soldOut ? ('SOLD_OUT' as const) : ('AVAILABLE' as const),
        })),
      },
      { onSuccess: onClose, onError: (e) => setError(problemMessage(e)) },
    )
  }

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{group ? 'Sửa nhóm lựa chọn' : 'Thêm nhóm lựa chọn'}</SheetTitle>
          <SheetDescription>Ví dụ “Cỡ ly”: bắt buộc chọn 1. “Topping”: tuỳ chọn, chọn tối đa 3.</SheetDescription>
        </SheetHeader>
        <form
          id="option-form"
          className="flex flex-1 flex-col gap-4 px-4"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="group-name">Tên nhóm</Label>
            <Input id="group-name" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="group-min">Chọn tối thiểu</Label>
              <Input id="group-min" inputMode="numeric" className="tabular-nums" value={min} onChange={(e) => setMin(e.target.value)} />
              <p className="text-xs text-muted-foreground">0 = khách có thể bỏ qua</p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="group-max">Chọn tối đa</Label>
              <Input id="group-max" inputMode="numeric" className="tabular-nums" value={max} onChange={(e) => setMax(e.target.value)} />
              <p className="text-xs text-muted-foreground">1 = chọn một</p>
            </div>
          </div>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 text-sm font-medium">Các lựa chọn</legend>
            {rows.map((row, index) => (
              <div key={row.key} className="flex flex-col gap-2 rounded-sm border p-3">
                <div className="flex items-center gap-2">
                  <Input
                    required
                    aria-label={`Tên lựa chọn ${index + 1}`}
                    placeholder="Tên, ví dụ L"
                    maxLength={60}
                    value={row.name}
                    onChange={(e) => update(row.key, { name: e.target.value })}
                  />
                  <Input
                    aria-label={`Giá cộng thêm ${index + 1}`}
                    inputMode="numeric"
                    className="w-28 tabular-nums"
                    placeholder="+ ₫"
                    value={row.priceDelta}
                    onChange={(e) => update(row.key, { priceDelta: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Bỏ lựa chọn ${index + 1}`}
                    disabled={rows.length === 1}
                    onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                  >
                    <Trash2Icon />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={row.defaultChoice}
                      onChange={(e) => update(row.key, { defaultChoice: e.target.checked })}
                    />
                    Chọn sẵn
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={row.soldOut}
                      onChange={(e) => update(row.key, { soldOut: e.target.checked })}
                    />
                    Đang hết
                  </label>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              disabled={rows.length >= 30}
              onClick={() => {
                setRows((prev) => [...prev, { key: nextKey, name: '', priceDelta: '0', defaultChoice: false, soldOut: false }])
                setNextKey((k) => k + 1)
              }}
            >
              <PlusIcon /> Thêm lựa chọn
            </Button>
          </fieldset>
          <FormError message={error} />
        </form>
        <SheetFooter className="flex-row justify-end gap-2 border-t px-4 py-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Huỷ
          </Button>
          <Button type="submit" form="option-form" disabled={save.isPending}>
            Lưu nhóm
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
