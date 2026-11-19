import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CopyButton } from '@/shared/ui/copy-button'
import { KeyRoundIcon, PlusIcon, SearchIcon, StoreIcon, UserRoundXIcon, UserRoundCheckIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useFeedback } from '@/shared/ui/feedback'
import { useSession } from '@/entities/session'
import { api, problemMessage } from '@/shared/api'
import { t } from '@/shared/i18n'
import { compactPhone, isPersonName, isVnPhone, passwordProblem } from '@/shared/lib/validate'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { EmptyState } from '@/shared/ui/empty-state'
import { FormRow } from '@/shared/ui/form-row'
import { Input } from '@/shared/ui/input'
import { PasswordStrength } from '@/shared/ui/password-strength'
import { Skeleton } from '@/shared/ui/skeleton'
import { Stepper } from '@/shared/ui/stepper'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { FormError } from '@/widgets/auth-shell'
import { TEAM_KEYS, useMainAccount, useMembers, useRoles, type Member } from './api'
import { PermissionPicker, PermissionSummary } from './permission-picker'

export { SellerTeamRolesPage } from './roles'
export { SellerTeamShopsPage } from './shops'

/**
 * Members of a main account (view-members.md, create-member.md): who they are, the login to hand over, which shops they work and with
 * which role, and quick actions (lock, new password). Laid out like Shopify's staff list and Seller Center's sub-accounts: one row a
 * person, status as a badge, the shops as chips, everything else one click away.
 */
export function SellerTeamMembersPage() {
  const feedback = useFeedback()
  const members = useMembers()
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [resetFor, setResetFor] = useState<Member | null>(null)
  const [editing, setEditing] = useState<Member | null>(null)
  const queryClient = useQueryClient()

  const toggle = useMutation({
    mutationFn: async (m: Member) => {
      const { data, error } = await api.PATCH('/api/seller-team/members/{id}', {
        params: { path: { id: m.id ?? '' } },
        body: { status: m.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' },
      })
      if (error || !data) throw error
      return data
    },
    onSuccess: (m) => {
      void queryClient.invalidateQueries({ queryKey: TEAM_KEYS.members })
      feedback.success(m.status === 'ACTIVE' ? t('Đã mở khoá thành viên. Họ đăng nhập lại được ngay.') : t('Đã khoá thành viên. Họ bị đăng xuất ngay và không đăng nhập được cho tới khi bạn mở khoá.'))
    },
    onError: (e) => feedback.error(e),
  })

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (members.data ?? []).filter((m) => !q || `${m.memberName} ${m.login} ${m.phone ?? ''}`.toLowerCase().includes(q))
  }, [members.data, query])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1>{t('Thành viên')}</h1>
          <p className="text-body-sm text-muted-foreground">{t('Mỗi thành viên đăng nhập bằng tên:mã của riêng mình và chỉ thấy cửa hàng, quyền bạn giao.')}</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <PlusIcon className="size-4" aria-hidden="true" />
          {t('Thêm thành viên')}
        </Button>
      </div>
      {members.data?.length ? (
        <div className="relative max-w-sm">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t('Tìm theo tên, tên đăng nhập, số điện thoại')} className="pl-9" aria-label={t('Tìm thành viên')} />
        </div>
      ) : null}
      {members.isPending ? <Skeleton className="h-48" /> : null}
      {members.isError ? <FormError message={problemMessage(members.error)} /> : null}
      {members.data && !members.data.length ? (
        <EmptyState title={t('Chưa có thành viên')}>
          {t('Tạo tài khoản cho nhân viên để họ xử lý đơn, trả lời khách hoặc sửa thực đơn mà không cần mật khẩu của bạn.')}
        </EmptyState>
      ) : null}
      {shown.length ? (
        <div className="overflow-x-auto rounded-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Thành viên')}</TableHead>
                <TableHead>{t('Cửa hàng và vai trò')}</TableHead>
                <TableHead>{t('Trạng thái')}</TableHead>
                <TableHead className="sr-only">{t('Thao tác')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <p className="font-medium">{m.memberName}</p>
                    <CopyText value={m.login ?? ''} />
                    {m.phone || m.email ? <p className="text-caption text-muted-foreground">{[m.phone, m.email].filter(Boolean).join(' · ')}</p> : null}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {(m.shops ?? []).map((s) => (
                        <Badge key={s.vendorId} variant="outline" title={s.permissions?.join(', ')}>
                          {s.shopName} · {s.roleName ?? t('Quyền riêng')}
                        </Badge>
                      ))}
                      {!m.shops?.length ? <span className="text-caption text-muted-foreground">{t('Chưa giao cửa hàng')}</span> : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    {m.status === 'ACTIVE' ? <Badge>{t('Đang hoạt động')}</Badge> : <Badge variant="destructive">{t('Đã khoá')}</Badge>}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(m)} aria-label={t('Giao việc')} title={t('Giao việc')}>
                        <StoreIcon className="size-4" aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setResetFor(m)} aria-label={t('Đặt lại mật khẩu')} title={t('Đặt lại mật khẩu')}>
                        <KeyRoundIcon className="size-4" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggle.mutate(m)}
                        disabled={toggle.isPending}
                        aria-label={m.status === 'ACTIVE' ? t('Khoá') : t('Mở khoá')}
                        title={m.status === 'ACTIVE' ? t('Khoá') : t('Mở khoá')}
                      >
                        {m.status === 'ACTIVE' ? <UserRoundXIcon className="size-4" aria-hidden="true" /> : <UserRoundCheckIcon className="size-4" aria-hidden="true" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : members.data?.length ? (
        <p className="text-body-sm text-muted-foreground">{t('Không có thành viên khớp với tìm kiếm.')}</p>
      ) : null}
      {creating ? <CreateMemberDialog onClose={() => setCreating(false)} /> : null}
      {resetFor ? <ResetPasswordDialog member={resetFor} onClose={() => setResetFor(null)} /> : null}
      {editing ? <AssignDialog member={editing} onClose={() => setEditing(null)} /> : null}
    </div>
  )
}

function CopyText({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-caption text-muted-foreground">
      {value}
      <CopyButton value={value} label={t('Sao chép {v}', { v: value })} iconOnly variant="ghost" />
    </span>
  )
}

type Draft = { memberName: string; phone: string; email: string; loginCode: string; password: string; confirmPassword: string }

/** Three steps, as create-member.md lays out: who, what they may do where, and the login to hand over. */
function CreateMemberDialog({ onClose }: { onClose: () => void }) {
  const { session } = useSession()
  const main = useMainAccount()
  const roles = useRoles()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>({ memberName: '', phone: '', email: '', loginCode: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof Draft | 'shops' | 'role', string>>>({})
  const [roleId, setRoleId] = useState<string>('')
  const [custom, setCustom] = useState<string[]>([])
  const [shops, setShops] = useState<string[]>([])
  const [created, setCreated] = useState<string | null>(null)
  const prefix = (session?.team?.login ?? '').split(':')[0]
  const linked = (main.data?.links ?? []).filter((l) => l.status === 'AUTHORIZED')

  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLInputElement>) => setDraft((d) => ({ ...d, [k]: k === 'loginCode' ? e.target.value.toLowerCase().replace(/\s/g, '') : e.target.value }))

  const checkInfo = () => {
    const next: typeof errors = {}
    if (!draft.memberName.trim() || !isPersonName(draft.memberName)) next.memberName = t('Họ tên chỉ gồm chữ cái và khoảng trắng')
    const phone = compactPhone(draft.phone)
    if (phone && !isVnPhone(phone, 'mobile')) next.phone = t('Số điện thoại di động Việt Nam không hợp lệ, ví dụ 0912345678')
    if (!/^[a-z0-9._-]{2,40}$/.test(draft.loginCode)) next.loginCode = t('2–40 ký tự: chữ thường không dấu, số, dấu chấm, gạch dưới, gạch ngang')
    else if (draft.loginCode === 'main') next.loginCode = t('Mã "main" dành riêng cho tài khoản chính.')
    const weak = passwordProblem(draft.password, draft.email, draft.memberName)
    if (weak) next.password = weak
    if (draft.password !== draft.confirmPassword) next.confirmPassword = t('Mật khẩu nhập lại không khớp')
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const save = useMutation({
    mutationFn: async () => {
      const { data, error } = await api.POST('/api/seller-team/members', {
        body: {
          memberName: draft.memberName.trim(),
          phone: compactPhone(draft.phone) || undefined,
          email: draft.email.trim() || undefined,
          loginCode: draft.loginCode,
          password: draft.password,
          confirmPassword: draft.confirmPassword,
          roleId: roleId && roleId !== 'custom' ? roleId : undefined,
          permissions: roleId === 'custom' ? custom : undefined,
          vendorIds: shops,
        },
      })
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: TEAM_KEYS.members })
      setCreated(data.login ?? null)
      setStep(2)
    },
  })

  const next = () => {
    if (step === 0 && checkInfo()) setStep(1)
    else if (step === 1) {
      const e: typeof errors = {}
      if (!roleId) e.role = t('Chọn một vai trò hoặc tự chọn quyền')
      if (!shops.length) e.shops = t('Chọn ít nhất một cửa hàng')
      setErrors(e)
      if (!Object.keys(e).length) save.mutate()
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('Thêm thành viên')}</DialogTitle>
          <DialogDescription>{t('Bạn đặt mật khẩu ban đầu và giao lại cho thành viên; họ đổi được sau khi đăng nhập.')}</DialogDescription>
        </DialogHeader>
        <Stepper steps={[{ label: t('Thông tin') }, { label: t('Quyền và cửa hàng') }, { label: t('Hoàn tất') }]} current={step} />
        {step === 0 ? (
          <div className="flex flex-col gap-4">
            <FormRow label={t('Họ tên')} htmlFor="m-name" required error={errors.memberName}>
              <Input id="m-name" maxLength={100} value={draft.memberName} onChange={set('memberName')} autoComplete="off" />
            </FormRow>
            <FormRow label={t('Mã đăng nhập')} htmlFor="m-code" required error={errors.loginCode} hint={t('Không đổi được sau khi tạo.')}>
              <div className="flex items-center gap-1">
                <span className="text-body-sm text-muted-foreground">{prefix}:</span>
                <Input id="m-code" maxLength={40} value={draft.loginCode} onChange={set('loginCode')} placeholder="nhanvien01" autoComplete="off" spellCheck={false} />
              </div>
            </FormRow>
            <FormRow label={t('Mật khẩu')} htmlFor="m-pass" required error={errors.password}>
              <Input id="m-pass" type="password" maxLength={100} value={draft.password} onChange={set('password')} autoComplete="new-password" />
            </FormRow>
            {!errors.password ? <PasswordStrength password={draft.password} email={draft.email} name={draft.memberName} /> : null}
            <FormRow label={t('Nhập lại mật khẩu')} htmlFor="m-pass2" required error={errors.confirmPassword}>
              <Input id="m-pass2" type="password" maxLength={100} value={draft.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" />
            </FormRow>
            <FormRow label={t('Số điện thoại')} htmlFor="m-phone" error={errors.phone}>
              <Input id="m-phone" type="tel" inputMode="tel" maxLength={15} value={draft.phone} onChange={set('phone')} placeholder="0912345678" />
            </FormRow>
            <FormRow label="Email" htmlFor="m-email">
              <Input id="m-email" type="email" maxLength={254} value={draft.email} onChange={set('email')} />
            </FormRow>
          </div>
        ) : null}
        {step === 1 ? (
          <div className="flex flex-col gap-5">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-label">{t('Vai trò')}</legend>
              {(roles.data ?? []).map((r) => (
                <label key={r.id} className="flex items-start gap-3 rounded-sm border p-3 text-body-sm has-[:checked]:border-primary">
                  <input type="radio" name="role" className="mt-0.5 accent-[var(--color-primary)]" checked={roleId === r.id} onChange={() => setRoleId(r.id ?? '')} />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">{r.name}</span>
                    <span className="text-caption text-muted-foreground">
                      <PermissionSummary codes={r.permissions ?? []} />
                    </span>
                  </span>
                </label>
              ))}
              <label className="flex items-center gap-3 rounded-sm border p-3 text-body-sm has-[:checked]:border-primary">
                <input type="radio" name="role" className="accent-[var(--color-primary)]" checked={roleId === 'custom'} onChange={() => setRoleId('custom')} />
                <span className="font-medium">{t('Tự chọn quyền cho người này')}</span>
              </label>
              {roleId === 'custom' ? <PermissionPicker value={custom} onChange={setCustom} idPrefix="new-member" /> : null}
              {errors.role ? <p role="alert" className="text-body-sm text-destructive">{errors.role}</p> : null}
            </fieldset>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-label">{t('Làm ở cửa hàng')}</legend>
              {linked.map((l) => (
                <label key={l.vendorId} className="flex items-center gap-3 text-body-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-[var(--color-primary)]"
                    checked={shops.includes(l.vendorId ?? '')}
                    onChange={(e) => setShops((s) => (e.target.checked ? [...s, l.vendorId ?? ''] : s.filter((v) => v !== l.vendorId)))}
                  />
                  {l.shopName}
                </label>
              ))}
              {!linked.length ? <p className="text-body-sm text-muted-foreground">{t('Chưa có cửa hàng liên kết. Liên kết cửa hàng trước ở mục Cửa hàng liên kết.')}</p> : null}
              {errors.shops ? <p role="alert" className="text-body-sm text-destructive">{errors.shops}</p> : null}
            </fieldset>
            {save.isError ? <FormError message={problemMessage(save.error)} /> : null}
          </div>
        ) : null}
        {step === 2 && created ? (
          <div className="flex flex-col gap-3 rounded-sm border bg-muted/40 p-4">
            <p className="text-body-sm">{t('Đã tạo thành viên. Gửi thông tin đăng nhập này cho họ:')}</p>
            <p className="font-mono text-body-sm">{created}</p>
            <CopyButton value={`${created}\n${draft.password}`} label={t('Sao chép tên đăng nhập và mật khẩu')} text={t('Sao chép tên đăng nhập và mật khẩu')} size="default" />
          </div>
        ) : null}
        <DialogFooter>
          {step === 1 ? (
            <Button variant="outline" onClick={() => setStep(0)}>
              {t('Quay lại')}
            </Button>
          ) : null}
          {step < 2 ? (
            <Button onClick={next} disabled={save.isPending}>
              {step === 0 ? t('Tiếp tục') : t('Tạo thành viên')}
            </Button>
          ) : (
            <Button onClick={onClose}>{t('Xong')}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ResetPasswordDialog({ member, onClose }: { member: Member; onClose: () => void }) {
  const feedback = useFeedback()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const save = useMutation({
    mutationFn: async () => {
      const { error: problem, response } = await api.POST('/api/seller-team/members/{id}/password', {
        params: { path: { id: member.id ?? '' } },
        body: { password, confirmPassword: confirm },
      })
      if (!response.ok) throw problem
    },
    onSuccess: () => {
      feedback.success(t('Đã đặt mật khẩu mới. Thành viên bị đăng xuất khỏi mọi thiết bị; gửi mật khẩu mới cho họ.'))
      onClose()
    },
    onError: (e) => setError(problemMessage(e)),
  })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const weak = passwordProblem(password, member.email ?? undefined, member.memberName ?? undefined)
    if (weak) return setError(weak)
    if (password !== confirm) return setError(t('Mật khẩu nhập lại không khớp'))
    setError(null)
    save.mutate()
  }
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Đặt lại mật khẩu')}</DialogTitle>
          <DialogDescription>{member.login}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <FormRow label={t('Mật khẩu mới')} htmlFor="r-pass" required>
            <Input id="r-pass" type="password" maxLength={100} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          </FormRow>
          <PasswordStrength password={password} email={member.email ?? undefined} name={member.memberName ?? undefined} />
          <FormRow label={t('Nhập lại mật khẩu')} htmlFor="r-pass2" required>
            <Input id="r-pass2" type="password" maxLength={100} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </FormRow>
          <FormError message={error} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('Huỷ')}
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {t('Lưu mật khẩu')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** One shop at a time (manage-shop-assignment.md): change the role there, add the member to another shop, or take a shop away. */
function AssignDialog({ member, onClose }: { member: Member; onClose: () => void }) {
  const feedback = useFeedback()
  const main = useMainAccount()
  const roles = useRoles()
  const queryClient = useQueryClient()
  const linked = (main.data?.links ?? []).filter((l) => l.status === 'AUTHORIZED')
  const current = (vendorId: string) => member.shops?.find((s) => s.vendorId === vendorId)
  const [picks, setPicks] = useState<Record<string, string>>(() =>
    Object.fromEntries((member.shops ?? []).map((s) => [s.vendorId ?? '', s.roleId ?? 'custom'])),
  )
  const [customs, setCustoms] = useState<Record<string, string[]>>(() =>
    Object.fromEntries((member.shops ?? []).map((s) => [s.vendorId ?? '', s.permissions ?? []])),
  )
  const [error, setError] = useState<string | null>(null)

  const apply = useMutation({
    mutationFn: async (vendorId: string) => {
      const pick = picks[vendorId]
      const res = pick
        ? await api.PUT('/api/seller-team/members/{id}/shops/{vendorId}', {
            params: { path: { id: member.id ?? '', vendorId } },
            body: pick === 'custom' ? { permissions: customs[vendorId] ?? [] } : { roleId: pick },
          })
        : await api.DELETE('/api/seller-team/members/{id}/shops/{vendorId}', { params: { path: { id: member.id ?? '', vendorId } } })
      if (res.error) throw res.error
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TEAM_KEYS.members })
      feedback.success(t('Đã lưu quyền của thành viên. Quyền bị bớt có hiệu lực ngay, quyền thêm có từ lần đăng nhập tới.'))
      setError(null)
    },
    onError: (e) => setError(problemMessage(e)),
  })

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('Giao việc cho {name}').replace('{name}', member.memberName ?? '')}</DialogTitle>
          <DialogDescription>{t('Mỗi cửa hàng một vai trò. Đổi ở cửa hàng này không ảnh hưởng cửa hàng khác.')}</DialogDescription>
        </DialogHeader>
        <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto">
          {linked.map((l) => {
            const v = l.vendorId ?? ''
            const pick = picks[v] ?? ''
            const had = current(v)
            return (
              <div key={v} className="flex flex-col gap-3 rounded-sm border p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{l.shopName}</p>
                  {had ? <Badge variant="secondary">{had.roleName ?? t('Quyền riêng')}</Badge> : <Badge variant="outline">{t('Chưa giao')}</Badge>}
                </div>
                <select
                  className="h-9 rounded-sm border bg-background px-2 text-body-sm"
                  value={pick}
                  onChange={(e) => setPicks((p) => ({ ...p, [v]: e.target.value }))}
                  aria-label={t('Vai trò ở {shop}').replace('{shop}', l.shopName ?? '')}
                >
                  <option value="">{t('Không làm ở cửa hàng này')}</option>
                  {(roles.data ?? []).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                  <option value="custom">{t('Tự chọn quyền')}</option>
                </select>
                {pick === 'custom' ? (
                  <PermissionPicker value={customs[v] ?? []} onChange={(next) => setCustoms((c) => ({ ...c, [v]: next }))} idPrefix={`assign-${v}`} />
                ) : null}
                <Button size="sm" variant="outline" className="self-end" disabled={apply.isPending || (!pick && !had)} onClick={() => apply.mutate(v)}>
                  {t('Lưu cho cửa hàng này')}
                </Button>
              </div>
            )
          })}
        </div>
        <FormError message={error} />
        <DialogFooter>
          <Button onClick={onClose}>{t('Xong')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
