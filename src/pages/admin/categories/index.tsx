import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronRightIcon, EyeOffIcon, PlusIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useSession } from '@/entities/session'
import { api, problemMessage, type components } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

type Node = components['schemas']['CategoryNode']

const QUERY_KEY = ['admin', 'categories']

function flatten(nodes: Node[], out: Node[] = []): Node[] {
  for (const n of nodes) {
    out.push(n)
    flatten(n.children ?? [], out)
  }
  return out
}

function formatRate(rate: number | undefined) {
  return rate === undefined || rate === null ? null : `${rate.toLocaleString('vi-VN')}%`
}

/** The platform category tree (manage-categories.md): 3 levels, a fixed root, a commission rate per node. */
export function AdminCategoriesPage() {
  const { session } = useSession()
  const tree = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/categories')
      if (error || !data) throw error
      return data
    },
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const all = useMemo(() => flatten(tree.data ?? []), [tree.data])
  const selected = all.find((n) => n.id === selectedId) ?? null

  if (!session?.permissions.has('category:write')) {
    return <p className="text-muted-foreground">Bạn không có quyền quản lý ngành hàng.</p>
  }

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const renderNode = (node: Node, inheritedHidden = false) => {
    const hidden = inheritedHidden || node.active === false
    const children = node.children ?? []
    const open = !collapsed.has(node.id!)
    return (
      <li key={node.id}>
        <div
          className={cn(
            'flex items-center gap-1 rounded-md pr-2',
            node.id === selectedId ? 'bg-brand-50 ring-1 ring-brand-400/40' : 'hover:bg-muted',
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn('size-8', children.length === 0 && 'invisible')}
            aria-label={open ? 'Thu gọn' : 'Mở rộng'}
            onClick={() => toggle(node.id!)}
          >
            {open ? <ChevronDownIcon /> : <ChevronRightIcon />}
          </Button>
          <button
            type="button"
            onClick={() => setSelectedId(node.id!)}
            className={cn('flex min-h-10 flex-1 items-center gap-2 text-left text-sm', hidden && 'text-muted-foreground')}
          >
            <span className={cn(node.level === 1 && 'font-semibold')}>{node.name}</span>
            <Badge variant="outline">Cấp {node.level}</Badge>
            {node.active === false ? (
              <Badge variant="secondary">
                <EyeOffIcon /> Đã ẩn
              </Badge>
            ) : null}
            <span className="ml-auto text-xs text-muted-foreground">
              {node.commissionRate !== undefined && node.commissionRate !== null
                ? formatRate(node.commissionRate)
                : node.effectiveCommissionRate !== undefined && node.effectiveCommissionRate !== null
                  ? `kế thừa ${formatRate(node.effectiveCommissionRate)}`
                  : 'mặc định hệ thống'}
            </span>
          </button>
        </div>
        {open && children.length > 0 ? (
          <ul className="ml-5 border-l pl-2">{children.map((c) => renderNode(c, hidden))}</ul>
        ) : null}
      </li>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Ngành hàng</h1>
        <p className="text-sm text-muted-foreground">
          Cây 3 cấp, cấp 1 cố định. Mỗi món thuộc một ngành cấp 3; hoa hồng lấy theo ngành gần nhất có đặt tỷ lệ.
        </p>
      </div>
      <div className="flex flex-wrap items-start gap-6">
        <Card className="min-w-0 flex-[999_1_32rem]">
          <CardContent>
            {tree.isPending ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="h-9" />
                ))}
              </div>
            ) : tree.isError ? (
              <FormError message={problemMessage(tree.error)} />
            ) : (
              <ul className="flex flex-col">{(tree.data ?? []).map((n) => renderNode(n))}</ul>
            )}
          </CardContent>
        </Card>
        <div className="flex flex-[1_1_22rem] flex-col gap-6">
          {selected ? (
            // Keyed by the saved values so the form starts over whenever the node changes.
            <EditCategory
              key={`${selected.id}:${selected.name}:${selected.commissionRate ?? ''}`}
              node={selected}
              all={all}
              onDeleted={() => setSelectedId(null)}
            />
          ) : null}
          <CreateCategory parent={selected} root={tree.data?.[0] ?? null} onCreated={setSelectedId} />
        </div>
      </div>
    </div>
  )
}

function useCategoryMutation<T>(fn: (input: T) => Promise<unknown>, success: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      toast.success(success)
      return queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
    onError: (error) => toast.error(problemMessage(error)),
  })
}

async function patchCategory(id: string, body: components['schemas']['CategoryUpdateRequest']) {
  const { data, error } = await api.PATCH('/api/admin/categories/{id}', { params: { path: { id } }, body })
  if (error) throw error
  return data
}

function EditCategory({ node, all, onDeleted }: { node: Node; all: Node[]; onDeleted: () => void }) {
  const [name, setName] = useState(node.name ?? '')
  const [rate, setRate] = useState(node.commissionRate === undefined || node.commissionRate === null ? '' : String(node.commissionRate))
  const isRoot = node.level === 1
  const parent = all.find((n) => n.id === node.parentId)
  const siblings = (parent?.children ?? []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
  const index = siblings.findIndex((s) => s.id === node.id)
  const moveTargets = all.filter((n) => n.level === (node.level ?? 0) - 1 && n.id !== node.parentId)

  const save = useCategoryMutation(async () => {
    const trimmed = rate.trim()
    await patchCategory(node.id!, {
      ...(isRoot ? {} : { name: name.trim() }),
      ...(trimmed === '' ? { clearCommissionRate: true } : { commissionRate: Number(trimmed.replace(',', '.')) }),
    })
  }, 'Đã lưu ngành hàng.')
  const setActive = useCategoryMutation((active: boolean) => patchCategory(node.id!, { active }), node.active === false ? 'Đã hiện lại ngành.' : 'Đã ẩn ngành.')
  const move = useCategoryMutation((parentId: string) => patchCategory(node.id!, { parentId }), 'Đã chuyển ngành.')
  const reorder = useCategoryMutation(async (direction: -1 | 1) => {
    const other = siblings[index + direction]
    if (!other) return
    await patchCategory(node.id!, { sortOrder: other.sortOrder })
    await patchCategory(other.id!, { sortOrder: node.sortOrder })
  }, 'Đã đổi thứ tự.')
  const remove = useCategoryMutation(async () => {
    const { error } = await api.DELETE('/api/admin/categories/{id}', { params: { path: { id: node.id! } } })
    if (error) throw error
    onDeleted()
  }, 'Đã xoá ngành.')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sửa: {node.name}</CardTitle>
        <CardDescription>
          {isRoot ? 'Ngành gốc cố định, chỉ đặt được tỷ lệ hoa hồng (áp dụng cho mọi ngành không tự đặt).' : `Ngành cấp ${node.level}.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            save.mutate(undefined)
          }}
        >
          {!isRoot ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="cat-name">Tên ngành</Label>
              <Input id="cat-name" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="cat-rate">Tỷ lệ hoa hồng (%)</Label>
            <Input
              id="cat-rate"
              inputMode="decimal"
              placeholder={
                node.effectiveCommissionRate !== undefined && node.effectiveCommissionRate !== null && node.commissionRate == null
                  ? `Để trống = kế thừa ${formatRate(node.effectiveCommissionRate)}`
                  : 'Để trống = kế thừa'
              }
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={save.isPending}>
            Lưu
          </Button>
        </form>
        {!isRoot ? (
          <div className="mt-6 flex flex-col gap-3 border-t pt-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled={index <= 0 || reorder.isPending} onClick={() => reorder.mutate(-1)}>
                <ArrowUpIcon /> Lên
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={index < 0 || index >= siblings.length - 1 || reorder.isPending}
                onClick={() => reorder.mutate(1)}
              >
                <ArrowDownIcon /> Xuống
              </Button>
              <Button variant="outline" size="sm" disabled={setActive.isPending} onClick={() => setActive.mutate(node.active === false)}>
                {node.active === false ? 'Hiện lại' : 'Ẩn ngành'}
              </Button>
            </div>
            {moveTargets.length > 0 ? (
              <div className="flex flex-col gap-2">
                <Label htmlFor="cat-move">Chuyển sang ngành cha</Label>
                <select
                  id="cat-move"
                  className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  defaultValue=""
                  onChange={(e) => e.target.value && move.mutate(e.target.value)}
                >
                  <option value="" disabled>
                    Chọn ngành cấp {(node.level ?? 0) - 1}…
                  </option>
                  {moveTargets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <Button
              variant="destructive"
              size="sm"
              disabled={remove.isPending}
              onClick={() => {
                if (window.confirm(`Xoá ngành “${node.name}”? Ngành đang có món sẽ không xoá được, hãy ẩn thay vì xoá.`)) {
                  remove.mutate(undefined)
                }
              }}
            >
              Xoá ngành
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function CreateCategory({ parent, root, onCreated }: { parent: Node | null; root: Node | null; onCreated: (id: string) => void }) {
  const queryClient = useQueryClient()
  const target = parent && (parent.level ?? 3) < 3 ? parent : root
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const create = useMutation({
    mutationFn: async () => {
      const { data, error: problem } = await api.POST('/api/admin/categories', {
        body: { parentId: target!.id!, name: name.trim() },
      })
      if (problem || !data) throw problem
      return data
    },
    onSuccess: async (data) => {
      toast.success('Đã thêm ngành.')
      setName('')
      setError(null)
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      onCreated(data.id!)
    },
    onError: (e) => setError(problemMessage(e)),
  })
  if (!target) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thêm ngành con</CardTitle>
        <CardDescription>
          Thêm vào “{target.name}” (cấp {(target.level ?? 0) + 1}). Chọn một ngành bên trái để thêm vào ngành đó.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            create.mutate()
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="cat-new">Tên ngành</Label>
            <Input id="cat-new" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <FormError message={error} />
          <Button type="submit" disabled={create.isPending}>
            <PlusIcon /> Thêm ngành
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
