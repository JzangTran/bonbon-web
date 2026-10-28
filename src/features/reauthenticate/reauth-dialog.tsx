import { useState } from 'react'
import { useSession } from '@/entities/session'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { PasswordInput } from '@/shared/ui/password-input'
import { FormError } from '@/widgets/auth-shell'
import { useReauthenticate } from './use-reauthenticate'

/**
 * Sensitive actions need a sign-in from the last 10 minutes. When the server answers REAUTH_REQUIRED the page opens this, the person
 * types their password again, the session gets fresh tokens and {@code onDone} retries what they were doing.
 */
export function ReauthDialog({ open, onOpenChange, onDone }: { open: boolean; onOpenChange: (open: boolean) => void; onDone: () => void }) {
  const { session, signOut } = useSession()
  const reauthenticate = useReauthenticate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const problem = await reauthenticate(password)
    setBusy(false)
    if (problem) {
      setError(problem)
      return
    }
    setPassword('')
    onOpenChange(false)
    onDone()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setPassword('')
          setError(null)
        }
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Nhập lại mật khẩu</DialogTitle>
            <DialogDescription>Việc này cần bạn đăng nhập trong 10 phút gần nhất. Nhập lại mật khẩu của {session?.email} để tiếp tục.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reauth-password">Mật khẩu</Label>
            <PasswordInput id="reauth-password" autoComplete="current-password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <FormError message={error} />
          <p className="text-xs text-muted-foreground">
            Đăng nhập bằng Google, không có mật khẩu?{' '}
            <button type="button" className="text-link" onClick={() => void signOut()}>
              Đăng xuất
            </button>{' '}
            rồi đăng nhập lại.
          </p>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={busy || password.length === 0}>
              {busy ? 'Đang xác nhận…' : 'Xác nhận'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
