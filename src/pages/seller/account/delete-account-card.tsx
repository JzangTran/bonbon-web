import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { useDeleteAccount, useDeletionCheck } from '@/entities/account-deletion'
import { useSession } from '@/entities/session'
import { useReauthGate } from '@/features/reauthenticate'
import { problemMessage } from '@/shared/api'
import { formatDateTime } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { PasswordInput } from '@/shared/ui/password-input'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

const BLOCKER_LINK: Record<string, string> = {
  ORDERS: '/seller/orders',
  ORDER_CASES: '/seller/order-cases',
  SUPPORT_TICKETS: '/seller/support-tickets',
  CLOSE_SHOP: '/seller/shop',
}

/** Deleting the account (delete-account.md): says what goes and what stays, lists what still blocks it, and waits out a grace period. */
export function DeleteAccountCard() {
  const { session, signOut } = useSession()
  const navigate = useNavigate()
  const check = useDeletionCheck(true)
  const remove = useDeleteAccount()
  const gate = useReauthGate()
  const [open, setOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const data = check.data

  const submit = () => {
    setError(null)
    const attempt = () =>
      remove.mutate(
        { confirmation: confirmation.trim(), password: data?.needsPassword ? password : undefined },
        {
          onSuccess: async (scheduled) => {
            setOpen(false)
            await signOut().catch(() => undefined)
            navigate('/seller/login', { replace: true })
            toast.success(`Tài khoản sẽ được xoá vào ${formatDateTime(scheduled.executesAt)}.`, {
              description: 'Đăng nhập lại trước thời điểm đó sẽ huỷ việc xoá.',
              duration: 20_000,
            })
          },
          onError: (e) => {
            if (!gate.handle(e, attempt)) setError(problemMessage(e))
          },
        },
      )
    attempt()
  }

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>Xoá tài khoản</CardTitle>
        <CardDescription>Xoá toàn bộ tài khoản, gồm cả vai trò khách và người bán nếu bạn có cả hai.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium">Sẽ bị xoá</p>
            <p className="text-muted-foreground">Tên, email, số điện thoại, ảnh, mật khẩu, địa chỉ giao hàng, cách đăng nhập và tuỳ chọn thông báo. Mọi phiên đăng nhập kết thúc ngay.</p>
          </div>
          <div>
            <p className="font-medium">Được giữ lại</p>
            <p className="text-muted-foreground">Đơn hàng, thanh toán, sổ cái, đánh giá và tin nhắn, dưới tên “Người dùng đã xóa”, vì cần cho đối soát và pháp lý.</p>
          </div>
        </div>
        {check.isPending ? <Skeleton className="h-16" /> : null}
        {check.isError ? <FormError message={problemMessage(check.error)} /> : null}
        {data && !data.allowed ? (
          <div className="flex flex-col gap-2 rounded-md bg-warning-subtle px-4 py-3 text-sm text-warning-fg">
            <p className="font-medium">Chưa xoá được vì còn việc chưa xong:</p>
            <ul className="flex flex-col gap-1">
              {(data.blockers ?? []).map((b) => (
                <li key={b.code}>
                  {b.message}{' '}
                  {b.link && BLOCKER_LINK[b.link] ? (
                    <Link className="font-medium underline" to={BLOCKER_LINK[b.link]}>
                      Xử lý
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {data ? (
          <p className="text-sm text-muted-foreground">
            Sau khi xác nhận, tài khoản chờ {data.graceDays} ngày rồi mới bị xoá thật. Trong thời gian đó, <b>đăng nhập lại sẽ huỷ việc xoá</b>.
          </p>
        ) : null}
        <FormError message={error} />
        <div>
          <Button variant="destructive" disabled={!data?.allowed} onClick={() => setOpen(true)}>
            Xoá tài khoản
          </Button>
        </div>
      </CardContent>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <DialogHeader>
              <DialogTitle>Xoá tài khoản?</DialogTitle>
              <DialogDescription>
                Gõ <b>DELETE</b> hoặc email <b>{session?.email}</b> để xác nhận{data?.needsPassword ? ' và nhập mật khẩu' : ''}. Bạn có {data?.graceDays} ngày để đổi ý bằng cách đăng nhập lại.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="delete-confirmation">Xác nhận</Label>
              <Input id="delete-confirmation" autoComplete="off" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
            </div>
            {data?.needsPassword ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="delete-password">Mật khẩu</Label>
                <PasswordInput id="delete-password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            ) : null}
            <FormError message={error} />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Huỷ
                </Button>
              </DialogClose>
              <Button type="submit" variant="destructive" disabled={confirmation.trim() === '' || (data?.needsPassword && password === '') || remove.isPending}>
                Xoá tài khoản
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {gate.dialog}
    </Card>
  )
}
