import { useState } from 'react'
import { useSession } from '@/entities/session'
import { api, problemMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { FormError, FormSuccess } from '@/widgets/auth-shell'

/** Create another administrator (admin:write); they receive an email link to set their own password. */
export function AdminsPage() {
  const { session } = useSession()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [created, setCreated] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!session?.permissions.has('admin:write')) {
    return <p className="text-muted-foreground">Bạn không có quyền quản lý quản trị viên.</p>
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCreated(null)
    setSubmitting(true)
    const { error: problem } = await api.POST('/api/admin/manage/admins', { body: { email, name } })
    setSubmitting(false)
    if (problem) {
      setError(problemMessage(problem))
      return
    }
    setCreated(email)
    setEmail('')
    setName('')
  }

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <h1 className="text-2xl font-bold">Quản trị viên</h1>
      <Card>
        <CardHeader>
          <CardTitle>Thêm quản trị viên</CardTitle>
          <CardDescription>Người được thêm sẽ nhận email để tự đặt mật khẩu (liên kết hiệu lực 24 giờ).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-admin-name">Họ tên</Label>
              <Input id="new-admin-name" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="new-admin-email">Email</Label>
              <Input id="new-admin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <FormError message={error} />
            {created ? <FormSuccess message={`Đã tạo tài khoản và gửi email đặt mật khẩu tới ${created}.`} /> : null}
            <Button type="submit" disabled={submitting}>
              Thêm quản trị viên
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
