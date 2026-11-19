import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { useFeedback } from '@/shared/ui/feedback'
import { api, problemMessage } from '@/shared/api'
import { t } from '@/shared/i18n'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { EmptyState } from '@/shared/ui/empty-state'
import { FormRow } from '@/shared/ui/form-row'
import { Input } from '@/shared/ui/input'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'
import { TEAM_KEYS, useRoles, type Role } from './api'
import { PermissionPicker, PermissionSummary } from './permission-picker'

/** Named, reusable permission bundles of this main account (view/create/edit/delete-seller-role.md). */
export function SellerTeamRolesPage() {
  const feedback = useFeedback()
  const roles = useRoles()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<Role | 'new' | null>(null)
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error, response } = await api.DELETE('/api/seller-team/roles/{id}', { params: { path: { id } } })
      if (!response.ok) throw error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TEAM_KEYS.roles })
      feedback.success(t('Đã xoá vai trò. Thành viên đang có vai trò này cần được gán vai trò khác.'))
    },
    onError: (e) => feedback.error(e),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1>{t('Vai trò và quyền')}</h1>
          <p className="text-body-sm text-muted-foreground">{t('Gom quyền thành vai trò để giao nhanh cho nhiều người, ví dụ Thu ngân hay Bếp trưởng.')}</p>
        </div>
        <Button onClick={() => setEditing('new')}>
          <PlusIcon className="size-4" aria-hidden="true" />
          {t('Tạo vai trò')}
        </Button>
      </div>
      {roles.isPending ? <Skeleton className="h-40" /> : null}
      {roles.isError ? <FormError message={problemMessage(roles.error)} /> : null}
      {roles.data && !roles.data.length ? (
        <EmptyState title={t('Chưa có vai trò')}>{t('Tạo vai trò đầu tiên, hoặc chọn quyền riêng cho từng người khi thêm thành viên.')}</EmptyState>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {(roles.data ?? []).map((r) => (
          <article key={r.id} className="flex flex-col gap-3 rounded-sm border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <h2 className="text-body font-semibold">{r.name}</h2>
                {r.description ? <p className="text-body-sm text-muted-foreground">{r.description}</p> : null}
              </div>
              <Badge variant="secondary">{t('{n} người').replace('{n}', String(r.memberCount ?? 0))}</Badge>
            </div>
            <p className="text-body-sm">
              <PermissionSummary codes={r.permissions ?? []} />
            </p>
            <div className="mt-auto flex justify-end gap-1">
              <Button variant="ghost" size="sm" onClick={() => setEditing(r)}>
                <PencilIcon className="size-4" aria-hidden="true" />
                {t('Sửa')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!!r.memberCount || remove.isPending}
                title={r.memberCount ? t('Đổi vai trò của các thành viên trước khi xoá') : undefined}
                onClick={() => r.id && remove.mutate(r.id)}
              >
                <Trash2Icon className="size-4" aria-hidden="true" />
                {t('Xoá')}
              </Button>
            </div>
          </article>
        ))}
      </div>
      {editing ? <RoleDialog role={editing === 'new' ? null : editing} onClose={() => setEditing(null)} /> : null}
    </div>
  )
}

function RoleDialog({ role, onClose }: { role: Role | null; onClose: () => void }) {
  const feedback = useFeedback()
  const queryClient = useQueryClient()
  const [name, setName] = useState(role?.name ?? '')
  const [description, setDescription] = useState(role?.description ?? '')
  const [permissions, setPermissions] = useState<string[]>(role?.permissions ?? [])
  const [nameError, setNameError] = useState<string | undefined>()
  const save = useMutation({
    mutationFn: async () => {
      const body = { name: name.trim(), description: description.trim() || undefined, permissions }
      const res = role?.id
        ? await api.PUT('/api/seller-team/roles/{id}', { params: { path: { id: role.id } }, body })
        : await api.POST('/api/seller-team/roles', { body })
      if (res.error) throw res.error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TEAM_KEYS.roles })
      void queryClient.invalidateQueries({ queryKey: TEAM_KEYS.members })
      feedback.success(role ? t('Đã lưu vai trò. Thành viên có vai trò này nhận quyền mới từ lần đăng nhập tới.') : t('Đã tạo vai trò. Gán vai trò này cho thành viên ở danh sách thành viên.'))
      onClose()
    },
  })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setNameError(t('Vui lòng nhập tên vai trò'))
    setNameError(undefined)
    save.mutate()
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{role ? t('Sửa vai trò') : t('Tạo vai trò')}</DialogTitle>
          <DialogDescription>{t('Bớt quyền thì người đang giữ vai trò mất quyền đó ngay.')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto" noValidate>
          <FormRow label={t('Tên vai trò')} htmlFor="role-name" required error={nameError}>
            <Input id="role-name" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('Thu ngân')} />
          </FormRow>
          <FormRow label={t('Mô tả')} htmlFor="role-desc">
            <Textarea id="role-desc" maxLength={300} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormRow>
          <PermissionPicker value={permissions} onChange={setPermissions} idPrefix="role" />
          {save.isError ? <FormError message={problemMessage(save.error)} /> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('Huỷ')}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {role ? t('Lưu') : t('Tạo vai trò')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
