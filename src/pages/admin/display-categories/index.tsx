import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useSession } from '@/entities/session'
import { api, problemMessage, type components } from '@/shared/api'
import { t } from '@/shared/i18n'
import { checkUpload } from '@/shared/lib/upload'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { ImageUpload } from '@/shared/ui/image-upload'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

type Display = components['schemas']['DisplayCategoryAdmin']
type Node = components['schemas']['CategoryNode']

const KEY = ['admin', 'display-categories']

/** Every level-3 category of the tree, with the names of its parents for the picker ("Đồ uống › Trà › Trà sữa"). */
function leavesOf(nodes: Node[], path: string[] = [], out: { id: string; name: string; path: string }[] = []) {
  for (const n of nodes) {
    if (n.level === 3) out.push({ id: n.id!, name: n.name!, path: [...path, n.name!].join(' › ') })
    leavesOf(n.children ?? [], n.level === 1 ? [] : [...path, n.name!], out)
  }
  return out
}

/**
 * The picture strip of the customer home page (owner decision 2026-11-03). Not the category tree: each display category gathers
 * leaf categories of the tree, and a customer who picks it sees the shops with dishes in any of them.
 */
export function AdminDisplayCategoriesPage() {
  const { session } = useSession()
  const queryClient = useQueryClient()
  const list = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/display-categories')
      if (error || !data) throw error
      return data
    },
  })
  const tree = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/categories')
      if (error || !data) throw error
      return data
    },
  })
  const leaves = useMemo(() => leavesOf(tree.data ?? []), [tree.data])
  const [editing, setEditing] = useState<Display | 'new' | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: KEY })
  const update = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: components['schemas']['DisplayCategoryUpdateRequest'] }) => {
      const { error } = await api.PATCH('/api/admin/display-categories/{id}', { params: { path: { id } }, body })
      if (error) throw error
    },
    onSuccess: refresh,
    onError: (e) => toast.error(problemMessage(e)),
  })
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await api.DELETE('/api/admin/display-categories/{id}', { params: { path: { id } } })
      if (error) throw error
    },
    onSuccess: async () => {
      toast.success(t('Đã xoá danh mục.'))
      await refresh()
    },
    onError: (e) => toast.error(problemMessage(e)),
  })
  const image = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const form = new FormData()
      form.append('file', file)
      const { error } = await api.PUT('/api/admin/display-categories/{id}/image', {
        params: { path: { id } },
        body: form as unknown as { file: string },
        bodySerializer: (body) => body as unknown as FormData,
      })
      if (error) throw error
    },
    onSuccess: async () => {
      toast.success(t('Đã đổi ảnh.'))
      await refresh()
    },
    onError: (e) => toast.error(problemMessage(e)),
  })

  if (!session?.permissions.has('category:write')) {
    return <p className="text-muted-foreground">{t('Bạn không có quyền quản lý ngành hàng.')}</p>
  }

  const items = list.data ?? []
  const move = (index: number, by: -1 | 1) => {
    const a = items[index]
    const b = items[index + by]
    if (!a || !b) return
    update.mutate({ id: a.id!, body: { sortOrder: b.sortOrder } })
    update.mutate({ id: b.id!, body: { sortOrder: a.sortOrder } })
  }

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('Danh mục trang chủ')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('Dải ảnh danh mục trên trang chủ ứng dụng khách. Mỗi danh mục gom một hoặc nhiều ngành cấp 3; khách chọn danh mục sẽ thấy các quán có món trong các ngành đó.')}
          </p>
        </div>
        <Button onClick={() => setEditing('new')}>
          <PlusIcon />
          {t('Thêm danh mục')}
        </Button>
      </div>

      {list.isPending ? <Skeleton className="h-40" /> : null}
      <FormError message={list.isError ? problemMessage(list.error) : null} />
      {list.data && items.length === 0 ? <p className="text-muted-foreground">{t('Chưa có danh mục nào. Trang chủ sẽ không hiện dải danh mục.')}</p> : null}

      <ul className="flex flex-col gap-3">
        {items.map((d, index) => (
          <li key={d.id}>
            <Card className={cn('flex-row items-center gap-4 p-4', !d.active && 'opacity-60')}>
              <ImageUpload
                label={t('Ảnh của {v0}', { v0: d.name })}
                accept="image/jpeg,image/png,image/webp"
                previewUrl={d.imageUrl}
                pending={image.isPending && image.variables?.id === d.id}
                onPick={async (file) => {
                  const problem = await checkUpload(file, { maxMb: 2 })
                  if (problem) toast.error(problem)
                  else image.mutate({ id: d.id!, file })
                }}
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{d.name}</span>
                  {!d.active ? <Badge variant="secondary">{t('Đang ẩn')}</Badge> : null}
                </div>
                <div className="flex flex-wrap gap-1">
                  {(d.leaves ?? []).map((l) => (
                    <Badge key={l.id} variant="outline">
                      {l.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" aria-label={t('Chuyển lên')} disabled={index === 0} onClick={() => move(index, -1)}>
                  <ArrowUpIcon />
                </Button>
                <Button variant="ghost" size="icon" aria-label={t('Chuyển xuống')} disabled={index === items.length - 1} onClick={() => move(index, 1)}>
                  <ArrowDownIcon />
                </Button>
                <Button variant="outline" size="sm" onClick={() => update.mutate({ id: d.id!, body: { active: !d.active } })}>
                  {d.active ? t('Ẩn') : t('Hiện')}
                </Button>
                <Button variant="ghost" size="icon" aria-label={t('Sửa {v0}', { v0: d.name })} onClick={() => setEditing(d)}>
                  <PencilIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('Xoá {v0}', { v0: d.name })}
                  onClick={() => {
                    if (window.confirm(t('Xoá danh mục “{v0}” khỏi trang chủ?', { v0: d.name }))) remove.mutate(d.id!)
                  }}
                >
                  <Trash2Icon />
                </Button>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {editing ? (
        <DisplayForm key={editing === 'new' ? 'new' : editing.id} existing={editing === 'new' ? null : editing} leaves={leaves} onDone={() => setEditing(null)} />
      ) : null}
    </div>
  )
}

/** Name and the leaf categories gathered; a filter narrows the long list of leaves. */
function DisplayForm({ existing, leaves, onDone }: { existing: Display | null; leaves: { id: string; name: string; path: string }[]; onDone: () => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(existing?.name ?? '')
  const [picked, setPicked] = useState<Set<string>>(new Set((existing?.leaves ?? []).map((l) => l.id!)))
  const [filter, setFilter] = useState('')
  const shown = leaves.filter((l) => !filter.trim() || l.path.toLowerCase().includes(filter.trim().toLowerCase()))
  const save = useMutation({
    mutationFn: async () => {
      const leafIds = [...picked]
      const { error } = existing
        ? await api.PATCH('/api/admin/display-categories/{id}', { params: { path: { id: existing.id! } }, body: { name: name.trim(), leafIds } })
        : await api.POST('/api/admin/display-categories', { body: { name: name.trim(), leafIds } })
      if (error) throw error
    },
    onSuccess: async () => {
      toast.success(existing ? t('Đã lưu danh mục.') : t('Đã thêm danh mục. Hãy thêm ảnh cho danh mục.'))
      await queryClient.invalidateQueries({ queryKey: KEY })
      onDone()
    },
  })
  const toggle = (id: string) =>
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <Card>
      <CardHeader>
        <CardTitle>{existing ? t('Sửa danh mục') : t('Thêm danh mục')}</CardTitle>
        <CardDescription>{t('Chọn các ngành cấp 3 thuộc danh mục này. Ảnh danh mục đặt ở danh sách bên trên.')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex max-w-sm flex-col gap-1.5">
          <Label htmlFor="display-name">{t('Tên hiển thị')}</Label>
          <Input id="display-name" value={name} maxLength={40} placeholder={t('Ví dụ: Trà sữa')} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="display-filter">
            {t('Ngành cấp 3')} · {t('đã chọn {v0}', { v0: picked.size })}
          </Label>
          <Input id="display-filter" className="max-w-sm" value={filter} placeholder={t('Lọc theo tên ngành')} onChange={(e) => setFilter(e.target.value)} />
          <ul className="grid max-h-72 gap-1 overflow-y-auto rounded-md border p-2 sm:grid-cols-2">
            {shown.map((l) => (
              <li key={l.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-muted">
                  <input type="checkbox" className="size-4 accent-primary" checked={picked.has(l.id)} onChange={() => toggle(l.id)} />
                  <span className="truncate" title={l.path}>
                    {l.path}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <FormError message={save.isError ? problemMessage(save.error) : null} />
        <div className="flex gap-2">
          <Button disabled={!name.trim() || picked.size === 0 || save.isPending} onClick={() => save.mutate()}>
            {existing ? t('Lưu') : t('Thêm')}
          </Button>
          <Button variant="ghost" onClick={onDone}>
            {t('Huỷ')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
