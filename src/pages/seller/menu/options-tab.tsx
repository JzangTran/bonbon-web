import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { useOptionMutation, type Menu, type OptionGroup, type OptionGroups } from '@/entities/menu'
import { api } from '@/shared/api'
import { formatVnd } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { OptionGroupSheet } from './option-group-sheet'

function rule(group: OptionGroup) {
  const range = group.min === group.max ? `${group.max}` : `${group.min}–${group.max}`
  return `${group.min === 0 ? 'Tuỳ chọn' : 'Bắt buộc'}, chọn ${range}`
}

export function OptionsTab({ menu, groups }: { menu: Menu; groups: OptionGroups }) {
  const list = groups.groups ?? []
  const [editing, setEditing] = useState<OptionGroup | 'new' | null>(null)
  const dishName = (id: string) => (menu.sections ?? []).flatMap((s) => s.items ?? []).find((i) => i.id === id)?.name

  return (
    <div className="flex flex-col gap-6">
      {list.length === 0 ? (
        <Card className="items-start gap-3 p-6">
          <p className="font-semibold">Chưa có nhóm lựa chọn</p>
          <p className="text-sm text-muted-foreground">
            Dùng cho cỡ ly, độ ngọt, topping… Tạo một lần, gắn cho nhiều món, khách chọn khi đặt.
          </p>
          <Button onClick={() => setEditing('new')}>
            <PlusIcon /> Thêm nhóm lựa chọn
          </Button>
        </Card>
      ) : (
        <>
          {list.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              dishNames={(group.menuItemIds ?? []).map(dishName).filter((n): n is string => Boolean(n))}
              onEdit={() => setEditing(group)}
            />
          ))}
          <div>
            <Button variant="outline" onClick={() => setEditing('new')}>
              <PlusIcon /> Thêm nhóm lựa chọn
            </Button>
          </div>
        </>
      )}
      {editing ? (
        <OptionGroupSheet key={editing === 'new' ? 'new' : editing.id} group={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  )
}

function GroupCard({ group, dishNames, onEdit }: { group: OptionGroup; dishNames: string[]; onEdit: () => void }) {
  const remove = useOptionMutation(
    () => api.DELETE('/api/merchant/option-groups/{id}', { params: { path: { id: group.id! } } }),
    'Đã xoá nhóm lựa chọn.',
  )
  const setStatus = useOptionMutation(({ id, status }: { id: string; status: 'AVAILABLE' | 'SOLD_OUT' }) =>
    api.PATCH('/api/merchant/options/{id}/status', { params: { path: { id } }, body: { status } }),
  )

  return (
    <Card className="gap-0 p-0">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <h2 className="text-lg font-semibold">{group.name}</h2>
        <Badge variant="outline">{rule(group)}</Badge>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" aria-label={`Sửa nhóm ${group.name}`} onClick={onEdit}>
            <PencilIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Xoá nhóm ${group.name}`}
            disabled={remove.isPending}
            onClick={() => {
              const used = dishNames.length > 0 ? ` Nhóm đang gắn với ${dishNames.length} món và sẽ bị gỡ khỏi các món đó.` : ''
              if (window.confirm(`Xoá nhóm “${group.name}”?${used}`)) remove.mutate(undefined)
            }}
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>
      <ul className="divide-y">
        {(group.options ?? []).map((option) => {
          const soldOut = option.status === 'SOLD_OUT'
          return (
            <li key={option.id} className="flex flex-wrap items-center gap-3 px-4 py-2">
              <span className={soldOut ? 'flex-1 text-muted-foreground' : 'flex-1'}>
                {option.name}
                {option.defaultChoice ? <span className="ml-2 text-xs text-muted-foreground">mặc định</span> : null}
              </span>
              <span className="tabular-nums">{option.priceDelta ? `+${formatVnd(option.priceDelta)}` : 'Miễn phí'}</span>
              <Button
                variant={soldOut ? 'secondary' : 'outline'}
                size="sm"
                aria-pressed={!soldOut}
                disabled={setStatus.isPending}
                onClick={() => setStatus.mutate({ id: option.id!, status: soldOut ? 'AVAILABLE' : 'SOLD_OUT' })}
              >
                {soldOut ? 'Đang hết' : 'Còn hàng'}
              </Button>
            </li>
          )
        })}
      </ul>
      <p className="border-t px-4 py-2 text-xs text-muted-foreground">
        {dishNames.length === 0 ? 'Chưa gắn với món nào.' : `Dùng cho: ${dishNames.join(', ')}`}
      </p>
    </Card>
  )
}
