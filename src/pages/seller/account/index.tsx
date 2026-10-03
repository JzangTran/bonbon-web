import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { useSession } from '@/entities/session'
import { api, problemMessage } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { FormError, FormSuccess } from '@/widgets/auth-shell'

const VN_MOBILE = /^(0|\+84)(3|5|7|8|9)\d{8}$/

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(100),
  phone: z.string().trim().refine((v) => v === '' || VN_MOBILE.test(v), 'Số điện thoại di động Việt Nam không hợp lệ'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').max(100),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'Mật khẩu nhập lại không khớp' })

export function SellerAccountPage() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Tài khoản</h1>
      <ProfileCard />
      <PasswordCard />
      <SessionsCard />
    </div>
  )
}

function ProfileCard() {
  const queryClient = useQueryClient()
  const profile = useQuery({
    queryKey: ['account', 'me'],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/account/me')
      if (error || !data) throw error
      return data
    },
  })
  const form = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema), defaultValues: { name: '', phone: '' } })
  useEffect(() => {
    if (profile.data) form.reset({ name: profile.data.name ?? '', phone: profile.data.phone ?? '' })
  }, [profile.data, form])
  const save = useMutation({
    mutationFn: async (values: z.infer<typeof profileSchema>) => {
      const { data, error } = await api.PATCH('/api/account/me', { body: values })
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => queryClient.setQueryData(['account', 'me'], data),
  })
  const errors = form.formState.errors

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cá nhân</CardTitle>
        <CardDescription>Email đăng nhập: {profile.data?.email ?? '…'} (không đổi được)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-name">Họ tên</Label>
            <Input id="profile-name" aria-invalid={!!errors.name} {...form.register('name')} />
            {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-phone">Số điện thoại</Label>
            <Input id="profile-phone" inputMode="tel" placeholder="0912345678" aria-invalid={!!errors.phone} {...form.register('phone')} />
            {errors.phone ? <p className="text-sm text-destructive">{errors.phone.message}</p> : null}
          </div>
          {save.isError ? <FormError message={problemMessage(save.error)} /> : null}
          {save.isSuccess ? <FormSuccess message="Đã lưu thông tin." /> : null}
          <Button type="submit" disabled={save.isPending || profile.isPending}>
            Lưu thay đổi
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function PasswordCard() {
  const { session, signIn } = useSession()
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const errors = form.formState.errors

  const onSubmit = form.handleSubmit(async ({ currentPassword, newPassword }) => {
    setError(null)
    setDone(false)
    const { data, error: problem } = await api.POST('/api/account/change-password', { body: { currentPassword, newPassword } })
    if (!data?.accessToken || !data.refreshToken || !session) {
      setError(problemMessage(problem as unknown))
      return
    }
    // Every other device is signed out; this one continues with the fresh pair.
    signIn({ ...session, accessToken: data.accessToken, refreshToken: data.refreshToken })
    form.reset()
    setDone(true)
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
        <CardDescription>Các thiết bị khác sẽ bị đăng xuất; thiết bị này vẫn giữ đăng nhập.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
            <div key={field} className="flex flex-col gap-2">
              <Label htmlFor={field}>
                {field === 'currentPassword' ? 'Mật khẩu hiện tại' : field === 'newPassword' ? 'Mật khẩu mới' : 'Nhập lại mật khẩu mới'}
              </Label>
              <Input
                id={field}
                type="password"
                autoComplete={field === 'currentPassword' ? 'current-password' : 'new-password'}
                aria-invalid={!!errors[field]}
                {...form.register(field)}
              />
              {errors[field] ? <p className="text-sm text-destructive">{errors[field]?.message}</p> : null}
            </div>
          ))}
          <FormError message={error} />
          {done ? <FormSuccess message="Đã đổi mật khẩu." /> : null}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Đổi mật khẩu
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function SessionsCard() {
  const { signOut } = useSession()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const logoutAll = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { error: problem, response } = await api.POST('/api/auth/logout-all', { body: { password } })
    if (!response.ok) {
      setError(problemMessage(problem as unknown))
      return
    }
    await signOut().catch(() => undefined)
    navigate('/seller/login', { replace: true })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đăng xuất khỏi mọi thiết bị</CardTitle>
        <CardDescription>Dùng khi bạn nghi tài khoản bị người khác đăng nhập. Bạn sẽ phải đăng nhập lại.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={logoutAll} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="logout-all-password">Nhập mật khẩu để xác nhận</Label>
            <Input id="logout-all-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <FormError message={error} />
          <Button type="submit" variant="destructive">
            Đăng xuất mọi thiết bị
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
