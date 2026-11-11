import { TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAdminAppConfig, useSetMaintenance, useSetVersionPolicy, type AppPlatform, type AppVersionPolicy, type MaintenanceLevel, type MaintenanceStatus } from '@/entities/app-config'
import { useSession } from '@/entities/session'
import { useReauthGate } from '@/features/reauthenticate'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Textarea } from '@/shared/ui/textarea'
import { FormError } from '@/widgets/auth-shell'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { t } from '@/shared/i18n'

const PLATFORMS: { id: AppPlatform; label: string }[] = [
  { id: 'ANDROID', label: 'Android' },
  { id: 'IOS', label: 'iOS' },
]
const LEVELS: { id: MaintenanceLevel; label: string; hint: string }[] = [
  { id: 'NONE', label: t('Tắt'), hint: t('Hệ thống hoạt động bình thường.') },
  { id: 'READ_ONLY', label: t('Chỉ xem'), hint: t('Xem được, mọi thao tác ghi (đặt món, cập nhật...) bị từ chối.') },
  { id: 'FULL', label: t('Dừng hoàn toàn'), hint: t('Chỉ còn cấu hình, kiểm tra sức khoẻ, đăng nhập quản trị và webhook thanh toán.') },
]
const VERSION = /^[0-9]+(\.[0-9]+){0,3}$/

/** Compares dotted versions part by part ("1.10.0" is above "1.9.0"), as the server does. */
function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (diff !== 0) return diff
  }
  return 0
}

/** `<input type="datetime-local">` value for an instant, in the browser's own zone. */
function toLocalInput(iso: string | undefined): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** The oldest app version still served, the newest one, and the maintenance switch (manage-app-config.md). Each change is logged with its reason. */
export function AdminAppConfigPage() {
  const { session } = useSession()
  const allowed = !!session?.permissions.has('app-config:write')
  const config = useAdminAppConfig(allowed)
  const [tab, setTab] = useState<'versions' | 'maintenance'>('versions')

  if (!allowed) return <p className="text-muted-foreground">{t('Bạn không có quyền sửa cấu hình app.')}</p>

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <PageTabs
        label={t('Cấu hình app')}
        tabs={[
          { id: 'versions', label: t('Phiên bản tối thiểu') },
          { id: 'maintenance', label: t('Bảo trì') },
        ]}
        value={tab}
        onValueChange={(id) => setTab(id as 'versions' | 'maintenance')}
      />
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">{t('Cấu hình app')}</h1>
        <p className="text-sm text-muted-foreground">{t('Chỉ ảnh hưởng ứng dụng điện thoại. Mọi thay đổi cần lý do và bạn đã đăng nhập trong 10 phút gần nhất.')}</p>
      </div>
      {config.isError ? <FormError message={problemMessage(config.error)} /> : null}
      {config.isPending ? <Skeleton className="h-64" /> : null}
      {config.data ? (
        <>
          {tab === 'versions' ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {PLATFORMS.map((p) => (
                <VersionCard key={p.id} platform={p.id} label={p.label} policy={config.data.policies?.find((x) => x.platform === p.id)} />
              ))}
            </div>
          ) : (
            <MaintenanceCard current={config.data.maintenance} />
          )}
        </>
      ) : null}
    </div>
  )
}

function VersionCard({ platform, label, policy }: { platform: AppPlatform; label: string; policy: AppVersionPolicy | undefined }) {
  const save = useSetVersionPolicy()
  const gate = useReauthGate()
  const [min, setMin] = useState(policy?.minSupportedVersion ?? '')
  const [latest, setLatest] = useState(policy?.latestVersion ?? '')
  const [storeUrl, setStoreUrl] = useState(policy?.storeUrl ?? '')
  const [message, setMessage] = useState(policy?.message ?? '')
  const [reason, setReason] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const valid = VERSION.test(min) && VERSION.test(latest)
  const belowMin = valid && compareVersions(latest, min) < 0
  const raising = valid && !!policy?.minSupportedVersion && compareVersions(min, policy.minSupportedVersion) > 0
  const changed = min !== (policy?.minSupportedVersion ?? '') || latest !== (policy?.latestVersion ?? '') || storeUrl !== (policy?.storeUrl ?? '') || message !== (policy?.message ?? '')

  const submit = () => {
    setError(null)
    const body = { platform, minSupportedVersion: min, latestVersion: latest, storeUrl: storeUrl || undefined, message: message || undefined, reason: reason.trim() }
    const attempt = () =>
      save.mutate(body, {
        onSuccess: () => {
          toast.success(t('Đã lưu cấu hình {v0}.', { v0: label }))
          setReason('')
        },
        onError: (e) => {
          if (!gate.handle(e, attempt)) setError(problemMessage(e))
        },
      })
    attempt()
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${platform}-min`}>{t('Bản tối thiểu')}</Label>
            <Input id={`${platform}-min`} inputMode="decimal" placeholder="1.0.0" value={min} onChange={(e) => setMin(e.target.value.trim())} aria-invalid={min !== '' && !VERSION.test(min)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${platform}-latest`}>{t('Bản mới nhất')}</Label>
            <Input id={`${platform}-latest`} inputMode="decimal" placeholder="1.0.0" value={latest} onChange={(e) => setLatest(e.target.value.trim())} aria-invalid={latest !== '' && !VERSION.test(latest)} />
          </div>
        </div>
        {belowMin ? <p className="text-sm text-danger-fg">{t('Bản mới nhất không được thấp hơn bản tối thiểu.')}</p> : null}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${platform}-store`}>{t('Liên kết cửa hàng ứng dụng')}</Label>
          <Input id={`${platform}-store`} type="url" maxLength={500} placeholder="https://" value={storeUrl} onChange={(e) => setStoreUrl(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${platform}-message`}>{t('Lời nhắn khi bắt cập nhật')}</Label>
          <Textarea id={`${platform}-message`} rows={2} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${platform}-reason`}>{t('Lý do thay đổi (được ghi lại)')}</Label>
          <Input id={`${platform}-reason`} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <FormError message={error} />
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{policy?.updatedAt ? t('Cập nhật {v0}', { v0: formatDateTime(policy.updatedAt) }) : t('Chưa cấu hình')}</p>
          <Button
            disabled={!valid || belowMin || !changed || reason.trim() === '' || save.isPending}
            onClick={() => {
              if (raising) setConfirm(true)
              else submit()
            }}
          >
            {t('Lưu')}
          </Button>
        </div>
      </CardContent>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Nâng bản tối thiểu của ')}{label}{t(' lên ')}{min}?</DialogTitle>
            <DialogDescription>
              {t('Mọi người đang dùng bản thấp hơn ')}{min}{t(' sẽ bị chặn ngay ở mọi thao tác và chỉ thấy màn hình bắt cập nhật. Chỉ nâng sau khi bản ')}{min}{t(' đã có trên cửa hàng ứng dụng.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('Huỷ')}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirm(false)
                submit()
              }}
            >
              {t('Nâng bản tối thiểu')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {gate.dialog}
    </Card>
  )
}

function MaintenanceCard({ current }: { current: MaintenanceStatus | undefined }) {
  const save = useSetMaintenance()
  const gate = useReauthGate()
  const [level, setLevel] = useState<MaintenanceLevel>((current?.level as MaintenanceLevel | undefined) ?? 'NONE')
  const [message, setMessage] = useState(current?.message ?? '')
  const [startsAt, setStartsAt] = useState(toLocalInput(current?.startsAt))
  const [endsAt, setEndsAt] = useState(toLocalInput(current?.endsAt))
  const [reason, setReason] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const windowInvalid = startsAt !== '' && endsAt !== '' && new Date(endsAt) <= new Date(startsAt)
  const submit = () => {
    setError(null)
    const body = {
      level,
      message: message || undefined,
      startsAt: level !== 'NONE' && startsAt ? new Date(startsAt).toISOString() : undefined,
      endsAt: level !== 'NONE' && endsAt ? new Date(endsAt).toISOString() : undefined,
      reason: reason.trim(),
    }
    const attempt = () =>
      save.mutate(body, {
        onSuccess: () => {
          toast.success(level === 'NONE' ? t('Đã tắt chế độ bảo trì.') : t('Đã đặt chế độ bảo trì.'))
          setReason('')
        },
        onError: (e) => {
          if (!gate.handle(e, attempt)) setError(problemMessage(e))
        },
      })
    attempt()
  }

  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          {t('Bảo trì')}
          {current?.active ? <Badge className="bg-danger-subtle text-danger-fg">{t('Đang bật: ')}{current.level === 'FULL' ? t('dừng hoàn toàn') : t('chỉ xem')}</Badge> : null}
          {!current?.active && current?.level && current.level !== 'NONE' ? <Badge className="bg-warning-subtle text-warning-fg">{t('Đã hẹn giờ')}</Badge> : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div role="radiogroup" aria-label={t('Mức bảo trì')} className="grid gap-2 sm:grid-cols-3">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              type="button"
              role="radio"
              aria-checked={level === l.id}
              onClick={() => setLevel(l.id)}
              className={cn('flex flex-col gap-1 rounded-sm border p-3 text-left text-sm', level === l.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50')}
            >
              <span className="font-semibold">{l.label}</span>
              <span className="text-xs text-muted-foreground">{l.hint}</span>
            </button>
          ))}
        </div>
        {level !== 'NONE' ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maint-start">{t('Bắt đầu (bỏ trống là ngay)')}</Label>
                <Input id="maint-start" type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maint-end">{t('Kết thúc dự kiến (bỏ trống là chưa biết)')}</Label>
                <Input id="maint-end" type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
              </div>
            </div>
            {windowInvalid ? <p className="text-sm text-danger-fg">{t('Giờ kết thúc phải sau giờ bắt đầu.')}</p> : null}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="maint-message">{t('Lời nhắn hiện cho người dùng')}</Label>
              <Textarea id="maint-message" rows={2} maxLength={500} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
          </>
        ) : null}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maint-reason">{t('Lý do thay đổi (được ghi lại)')}</Label>
          <Input id="maint-reason" maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        {level === 'FULL' ? (
          <p className="flex items-center gap-2 rounded-md bg-warning-subtle px-3 py-2 text-sm text-warning-fg">
            <TriangleAlertIcon className="size-4 shrink-0" />
            {t('Dừng hoàn toàn chặn cả khách và người bán. Quản trị viên vẫn vào được để tắt.')}
          </p>
        ) : null}
        <FormError message={error} />
        <div className="flex justify-end">
          <Button
            disabled={reason.trim() === '' || windowInvalid || save.isPending}
            variant={level === 'FULL' ? 'destructive' : 'default'}
            onClick={() => {
              if (level === 'FULL') setConfirm(true)
              else submit()
            }}
          >
            {level === 'NONE' ? t('Tắt bảo trì') : t('Bật bảo trì')}
          </Button>
        </div>
      </CardContent>
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('Dừng hoàn toàn hệ thống?')}</DialogTitle>
            <DialogDescription>
              {startsAt ? t('Từ {v0}', { v0: formatDateTime(new Date(startsAt).toISOString()) }) : t('Ngay bây giờ')}{t(', mọi thao tác của khách và người bán đều bị từ chối')}{endsAt ? t(' đến {v0}', { v0: formatDateTime(new Date(endsAt).toISOString()) }) : ''}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t('Huỷ')}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirm(false)
                submit()
              }}
            >
              {t('Bật bảo trì')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {gate.dialog}
    </Card>
  )
}
