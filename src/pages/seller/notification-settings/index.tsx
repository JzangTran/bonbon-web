import { LockIcon } from 'lucide-react'
import { useState } from 'react'
import { useNotificationPreferences, usePushDevices, useRemoveDevice, useSetQuietHours, useUpdatePreference } from '@/entities/notification-settings'
import { problemMessage } from '@/shared/api'
import { formatRelative } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

const CHANNEL_LABEL: Record<string, string> = { PUSH: 'Thông báo đẩy', EMAIL: 'Email' }

/** What reaches the seller where (manage-notification-preferences.md). Order alerts and security notices cannot be switched off. */
export function SellerNotificationSettingsPage() {
  const prefs = useNotificationPreferences()
  const update = useUpdatePreference()
  const settings = prefs.data

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Cài đặt thông báo</h1>
        <p className="text-sm text-muted-foreground">Tắt một kênh chỉ ngăn thông báo đến máy bạn; mọi thông báo vẫn nằm trong danh sách trong ứng dụng.</p>
      </div>

      {prefs.isError ? <FormError message={problemMessage(prefs.error)} /> : null}
      {prefs.isPending ? <Skeleton className="h-48" /> : null}

      <ul className="flex flex-col gap-3">
        {(settings?.categories ?? []).map((c) => (
          <li key={c.category}>
            <Card className="gap-3 p-4">
              <div>
                <h2 className="flex items-center gap-2 font-semibold">
                  {c.title}
                  {c.locked ? <LockIcon className="size-4 text-muted-foreground" aria-label="Không tắt được" /> : null}
                </h2>
                <p className="text-sm text-muted-foreground">{c.description}</p>
              </div>
              <div className="flex flex-wrap gap-4">
                {(c.channels ?? []).map((ch) => {
                  const id = `pref-${c.category}-${ch.channel}`
                  return (
                    <div key={ch.channel} className="flex items-center gap-2">
                      <input
                        id={id}
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={!!ch.enabled}
                        disabled={c.locked || update.isPending}
                        onChange={(e) => update.mutate({ category: c.category ?? '', channel: ch.channel as 'PUSH' | 'EMAIL', enabled: e.target.checked })}
                      />
                      <Label htmlFor={id}>{CHANNEL_LABEL[ch.channel ?? ''] ?? ch.channel}</Label>
                    </div>
                  )
                })}
              </div>
            </Card>
          </li>
        ))}
      </ul>

      {settings ? <QuietHours key={`${settings.quietHours?.start}-${settings.quietHours?.end}`} start={settings.quietHours?.start} end={settings.quietHours?.end} zone={settings.quietHours?.timeZone} /> : null}
      <Devices />
    </div>
  )
}

function QuietHours({ start, end, zone }: { start?: string; end?: string; zone?: string }) {
  const set = useSetQuietHours()
  const [from, setFrom] = useState(start ?? '22:00')
  const [to, setTo] = useState(end ?? '06:00')

  return (
    <Card className="gap-3 p-4">
      <div>
        <h2 className="font-semibold">Giờ yên lặng</h2>
        <p className="text-sm text-muted-foreground">
          Trong khung giờ này thông báo đẩy của các nhóm tắt được được giữ lại. Đơn mới và thông báo bảo mật vẫn đến ngay. Múi giờ {zone ?? 'Asia/Ho_Chi_Minh'}.
        </p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quiet-from">Từ</Label>
          <Input id="quiet-from" type="time" value={from} onChange={(e) => setFrom(e.target.value)} className="w-32" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quiet-to">Đến</Label>
          <Input id="quiet-to" type="time" value={to} onChange={(e) => setTo(e.target.value)} className="w-32" />
        </div>
        <Button disabled={set.isPending || !from || !to || from === to} onClick={() => set.mutate({ start: from, end: to })}>
          Lưu
        </Button>
        {start ? (
          <Button variant="outline" disabled={set.isPending} onClick={() => set.mutate({})}>
            Bỏ giờ yên lặng
          </Button>
        ) : null}
      </div>
    </Card>
  )
}

function Devices() {
  const devices = usePushDevices()
  const remove = useRemoveDevice()
  const items = devices.data?.items ?? []

  return (
    <Card className="gap-3 p-4">
      <div>
        <h2 className="font-semibold">Thiết bị nhận thông báo đẩy</h2>
        <p className="text-sm text-muted-foreground">Gỡ máy đã mất hoặc không còn dùng. Máy bị gỡ sẽ nhận lại thông báo nếu bạn đăng nhập lại trên đó.</p>
      </div>
      {devices.isPending ? <Skeleton className="h-12" /> : null}
      {devices.data && items.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có thiết bị nào. Đăng nhập trên ứng dụng điện thoại và cho phép thông báo để nhận đơn mới.</p> : null}
      <ul className="flex flex-col gap-2">
        {items.map((d) => (
          <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>
              {d.platform === 'IOS' ? 'iPhone' : d.platform === 'ANDROID' ? 'Android' : 'Trình duyệt'} · phiên bản {d.appVersion ?? '–'} · dùng {formatRelative(d.lastSeenAt)}
            </span>
            <Button size="sm" variant="outline" disabled={remove.isPending} onClick={() => d.id && remove.mutate(d.id)}>
              Gỡ
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  )
}
