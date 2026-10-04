import { ArrowDownIcon, ArrowUpIcon, CheckIcon, PencilIcon, PlusIcon, Trash2Icon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useMenuMutation, type Menu, type MenuItem, type MenuSection, type OptionGroups } from '@/entities/menu'
import { api } from '@/shared/api'
import { formatVnd } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { DishSheet } from './dish-sheet'

type Editing = { item: MenuItem | null; sectionId: string }

/** Moves {@code id} one place in {@code ids}; null when it cannot move that way. */
function moved(ids: string[], id: string, by: -1 | 1): string[] | null {
  const from = ids.indexOf(id)
  const to = from + by
  if (from < 0 || to < 0 || to >= ids.length) return null
  const next = ids.slice()
  next.splice(to, 0, ...next.splice(from, 1))
  return next
}

export function MenuTab({ menu, groups }: { menu: Menu; groups: OptionGroups }) {
  const sections = menu.sections ?? []
  const [editing, setEditing] = useState<Editing | null>(null)
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')

  const createSection = useMenuMutation(
    (sectionName: string) => api.POST('/api/merchant/menu-sections', { body: { name: sectionName } }),
    'Đã thêm mục thực đơn.',
  )
  const reorderSections = useMenuMutation(
    (ids: string[]) => api.PUT('/api/merchant/menu-sections/order', { body: { ids } }),
  )

  return (
    <div className="flex flex-col gap-6">
      {sections.length === 0 && !adding ? (
        <Card className="items-start gap-3 p-6">
          <p className="font-semibold">Thực đơn đang trống</p>
          <p className="text-sm text-muted-foreground">Bắt đầu bằng một mục như “Cơm”, “Nước uống”, rồi thêm món vào đó.</p>
          <Button onClick={() => setAdding(true)}>
            <PlusIcon /> Thêm mục thực đơn
          </Button>
        </Card>
      ) : null}

      {sections.map((section, index) => (
        <SectionCard
          key={section.id}
          section={section}
          canUp={index > 0}
          canDown={index < sections.length - 1}
          onMove={(by) => {
            const ids = moved(sections.map((s) => s.id!), section.id!, by)
            if (ids) reorderSections.mutate(ids)
          }}
          onAdd={() => setEditing({ item: null, sectionId: section.id! })}
          onEdit={(item) => setEditing({ item, sectionId: section.id! })}
        />
      ))}

      {sections.length > 0 || adding ? (
        adding ? (
          <form
            className="flex max-w-md items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              createSection.mutate(name.trim(), {
                onSuccess: () => {
                  setName('')
                  setAdding(false)
                },
              })
            }}
          >
            <Input autoFocus required maxLength={60} placeholder="Tên mục, ví dụ Cơm" value={name} onChange={(e) => setName(e.target.value)} />
            <Button type="submit" disabled={createSection.isPending}>
              Thêm
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)}>
              Huỷ
            </Button>
          </form>
        ) : (
          <div>
            <Button variant="outline" onClick={() => setAdding(true)}>
              <PlusIcon /> Thêm mục thực đơn
            </Button>
          </div>
        )
      ) : null}

      {editing ? (
        <DishSheet
          key={editing.item?.id ?? `new:${editing.sectionId}`}
          menu={menu}
          groups={groups}
          item={editing.item}
          sectionId={editing.sectionId}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  )
}

function SectionCard({
  section,
  canUp,
  canDown,
  onMove,
  onAdd,
  onEdit,
}: {
  section: MenuSection
  canUp: boolean
  canDown: boolean
  onMove: (by: -1 | 1) => void
  onAdd: () => void
  onEdit: (item: MenuItem) => void
}) {
  const items = section.items ?? []
  const [renaming, setRenaming] = useState(false)
  const [name, setName] = useState(section.name ?? '')
  const rename = useMenuMutation(
    (value: string) => api.PATCH('/api/merchant/menu-sections/{id}', { params: { path: { id: section.id! } }, body: { name: value } }),
    'Đã đổi tên mục.',
  )
  const remove = useMenuMutation(
    () => api.DELETE('/api/merchant/menu-sections/{id}', { params: { path: { id: section.id! } } }),
    'Đã xoá mục thực đơn.',
  )
  const reorderItems = useMenuMutation((ids: string[]) =>
    api.PUT('/api/merchant/menu-sections/{id}/items/order', { params: { path: { id: section.id! } }, body: { ids } }),
  )

  return (
    <Card className="gap-0 p-0">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        {renaming ? (
          <form
            className="flex flex-1 items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              rename.mutate(name.trim(), { onSuccess: () => setRenaming(false) })
            }}
          >
            <Input autoFocus required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
            <Button type="submit" size="icon-sm" aria-label="Lưu tên mục" disabled={rename.isPending}>
              <CheckIcon />
            </Button>
            <Button type="button" size="icon-sm" variant="ghost" aria-label="Huỷ" onClick={() => setRenaming(false)}>
              <XIcon />
            </Button>
          </form>
        ) : (
          <>
            <h2 className="text-lg font-semibold">{section.name}</h2>
            <span className="text-sm text-muted-foreground">{items.length} món</span>
            <Button variant="ghost" size="icon-sm" aria-label="Đổi tên mục" onClick={() => setRenaming(true)}>
              <PencilIcon />
            </Button>
          </>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label="Chuyển mục lên" disabled={!canUp} onClick={() => onMove(-1)}>
            <ArrowUpIcon />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Chuyển mục xuống" disabled={!canDown} onClick={() => onMove(1)}>
            <ArrowDownIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Xoá mục"
            disabled={remove.isPending}
            onClick={() => {
              if (window.confirm(`Xoá mục “${section.name}”? Mục còn món thì không xoá được.`)) remove.mutate(undefined)
            }}
          >
            <Trash2Icon />
          </Button>
          <Button size="sm" onClick={onAdd}>
            <PlusIcon /> Thêm món
          </Button>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-muted-foreground">Chưa có món nào trong mục này.</p>
      ) : (
        <ul className="divide-y">
          {items.map((item, index) => (
            <DishRow
              key={item.id}
              item={item}
              canUp={index > 0}
              canDown={index < items.length - 1}
              onMove={(by) => {
                const ids = moved(items.map((i) => i.id!), item.id!, by)
                if (ids) reorderItems.mutate(ids)
              }}
              onEdit={() => onEdit(item)}
            />
          ))}
        </ul>
      )}
    </Card>
  )
}

function DishRow({
  item,
  canUp,
  canDown,
  onMove,
  onEdit,
}: {
  item: MenuItem
  canUp: boolean
  canDown: boolean
  onMove: (by: -1 | 1) => void
  onEdit: () => void
}) {
  const toggle = useMenuMutation((status: 'AVAILABLE' | 'SOLD_OUT') =>
    api.PATCH('/api/merchant/menu-items/{id}/status', { params: { path: { id: item.id! } }, body: { status } }),
  )
  const remove = useMenuMutation(
    () => api.DELETE('/api/merchant/menu-items/{id}', { params: { path: { id: item.id! } } }),
    'Đã xoá món.',
  )
  const switchedOff = item.status === 'SOLD_OUT'
  const outOfStock = item.stockQuantity === 0
  // soldOut also covers a required option group that has no available option left.
  const blockedByOptions = Boolean(item.soldOut) && !switchedOff && !outOfStock

  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3">
      {item.photoUrl ? (
        <img src={item.photoUrl} alt="" className="size-14 shrink-0 object-cover" />
      ) : (
        <div className="size-14 shrink-0 bg-muted" aria-hidden />
      )}
      <div className="min-w-0 flex-1 basis-48">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn('font-semibold', item.soldOut && 'text-muted-foreground')}>{item.name}</span>
          {outOfStock ? <Badge variant="secondary">Hết tồn kho</Badge> : null}
          {blockedByOptions ? <Badge className="bg-warning-subtle text-warning-fg">Thiếu lựa chọn bắt buộc</Badge> : null}
        </div>
        {item.description ? <p className="line-clamp-1 text-sm text-muted-foreground">{item.description}</p> : null}
        {item.stockQuantity !== undefined && item.stockQuantity !== null && !outOfStock ? (
          <p className="text-xs text-muted-foreground">Còn {item.stockQuantity} phần</p>
        ) : null}
      </div>
      <span className="w-28 text-right font-semibold tabular-nums">{formatVnd(item.price)}</span>
      <Button
        variant={switchedOff ? 'secondary' : 'outline'}
        size="sm"
        aria-pressed={!switchedOff}
        disabled={toggle.isPending}
        onClick={() => toggle.mutate(switchedOff ? 'AVAILABLE' : 'SOLD_OUT')}
      >
        {switchedOff ? 'Đang hết món' : 'Đang bán'}
      </Button>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" aria-label="Chuyển món lên" disabled={!canUp} onClick={() => onMove(-1)}>
          <ArrowUpIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Chuyển món xuống" disabled={!canDown} onClick={() => onMove(1)}>
          <ArrowDownIcon />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label={`Sửa ${item.name}`} onClick={onEdit}>
          <PencilIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Xoá ${item.name}`}
          disabled={remove.isPending}
          onClick={() => {
            if (window.confirm(`Xoá món “${item.name}”? Đơn cũ vẫn giữ nguyên thông tin món.`)) remove.mutate(undefined)
          }}
        >
          <Trash2Icon />
        </Button>
      </div>
    </li>
  )
}
