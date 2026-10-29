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
import { DangerLinkCard } from '@/shared/ui/danger-link-card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { FormError, FormSuccess } from '@/widgets/auth-shell'
import { merchantPath } from '@/shared/config/sites'
import { PageTabs } from '@/shared/ui/workspace-slots'
import { t } from '@/shared/i18n'
import { LanguageSwitch } from '@/shared/ui/language-switch'

const VN_MOBILE = /^(0|\+84)(3|5|7|8|9)\d{8}$/

const profileSchema = z.object({
  name: z.string().trim().min(1, t('Vui lòng nhập họ tên')).max(100),
  phone: z.string().trim().max(30).refine((v) => v === '' || VN_MOBILE.test(v), t('Số điện thoại di động Việt Nam không hợp lệ')),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, t('Vui lòng nhập mật khẩu hiện tại')).max(100),
    newPassword: z.string().min(8, t('Mật khẩu tối thiểu 8 ký tự')).max(100),
    confirmPassword: z.string().max(100),
  })
  .refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: t('Mật khẩu nhập lại không khớp') })

type Tab = 'profile' | 'security' | 'delete'

/** The person's account in three tabs, one job each: who they are, how they sign in (password, devices), and leaving. */
export function SellerAccountPage() {
  const profile = useProfile()
  const [tab, setTab] = useState<Tab>('profile')
  // Google-only accounts have no password to change or to confirm with.
  const hasPassword = profile.data?.hasPassword !== false
  return (
    <div className="flex max-w-xl flex-col gap-8">
      <PageTabs
        label={t('Tài khoản')}
        tabs={[
          { id: 'profile', label: t('Thông tin cá nhân') },
          { id: 'security', label: t('Đăng nhập và bảo mật') },
          { id: 'delete', label: t('Xoá tài khoản') },
        ]}
        value={tab}
        onValueChange={(id) => setTab(id as Tab)}
      />
      <h1>{t('Tài khoản và bảo mật')}</h1>
      {tab === 'profile' ? (
        <div className="flex flex-col gap-12">
          <ProfileCard />
          <LanguageCard />
        </div>
      ) : null}
      {tab === 'security' ? (
        <div className="flex flex-col gap-12">
          {hasPassword ? <PasswordCard /> : null}
          <SessionsCard hasPassword={hasPassword} />
        </div>
      ) : null}
      {tab === 'delete' ? (
        <DangerLinkCard
          title={t('Xoá tài khoản')}
          description={t('Xoá toàn bộ tài khoản, gồm cả vai trò khách và người bán nếu bạn có cả hai. Có thời gian chờ trước khi xoá thật.')}
          to="/focus/delete-account"
          action={t('Xoá tài khoản')}
        />
      ) : null}
    </div>
  )
}

/** The language of the pages, remembered on this device. */
function LanguageCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Ngôn ngữ')}</CardTitle>
        <CardDescription>{t('Tiếng Việt hoặc tiếng Anh, ghi nhớ trên thiết bị này.')}</CardDescription>
      </CardHeader>
      <CardContent>
        <LanguageSwitch className="[&>span]:hidden" />
      </CardContent>
    </Card>
  )
}

function useProfile() {
  return useQuery({
    queryKey: ['account', 'me'],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/account/me')
      if (error || !data) throw error
      return data
    },
  })
}

function ProfileCard() {
  const queryClient = useQueryClient()
  const profile = useProfile()
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
        <CardTitle>{t('Thông tin cá nhân')}</CardTitle>
        <CardDescription>{t('Email đăng nhập: ')}{profile.data?.email ?? '…'}{t(' (không đổi được)')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit((v) => save.mutate(v))} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-name">{t('Họ tên')}</Label>
            <Input id="profile-name" aria-invalid={!!errors.name} {...form.register('name')} />
            {errors.name ? <p role="alert" className="text-sm text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="profile-phone">{t('Số điện thoại')}</Label>
            <Input id="profile-phone" inputMode="tel" placeholder="0912345678" aria-invalid={!!errors.phone} {...form.register('phone')} />
            {errors.phone ? <p role="alert" className="text-sm text-destructive">{errors.phone.message}</p> : null}
          </div>
          {save.isError ? <FormError message={problemMessage(save.error)} /> : null}
          {save.isSuccess ? <FormSuccess message={t('Đã lưu thông tin.')} /> : null}
          <Button type="submit" disabled={save.isPending || profile.isPending}>
            {t('Lưu thay đổi')}
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
        <CardTitle>{t('Đổi mật khẩu')}</CardTitle>
        <CardDescription>{t('Các thiết bị khác sẽ bị đăng xuất; thiết bị này vẫn giữ đăng nhập.')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
            <div key={field} className="flex flex-col gap-2">
              <Label htmlFor={field}>
                {field === 'currentPassword' ? t('Mật khẩu hiện tại') : field === 'newPassword' ? t('Mật khẩu mới') : t('Nhập lại mật khẩu mới')}
              </Label>
              <Input
                id={field}
                type="password"
                autoComplete={field === 'currentPassword' ? 'current-password' : 'new-password'}
                aria-invalid={!!errors[field]}
                {...form.register(field)}
              />
              {errors[field] ? <p role="alert" className="text-sm text-destructive">{errors[field]?.message}</p> : null}
            </div>
          ))}
          <FormError message={error} />
          {done ? <FormSuccess message={t('Đã đổi mật khẩu.')} /> : null}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {t('Đổi mật khẩu')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function SessionsCard({ hasPassword }: { hasPassword: boolean }) {
  const { signOut } = useSession()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const logoutAll = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { error: problem, response } = await api.POST('/api/auth/logout-all', { body: { password: hasPassword ? password : undefined } })
    if (!response.ok) {
      setError(problemMessage(problem as unknown))
      return
    }
    await signOut().catch(() => undefined)
    navigate(merchantPath('/login'), { replace: true })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Đăng xuất khỏi mọi thiết bị')}</CardTitle>
        <CardDescription>{t('Dùng khi bạn nghi tài khoản bị người khác đăng nhập. Bạn sẽ phải đăng nhập lại.')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={logoutAll} className="flex flex-col gap-4">
          {hasPassword ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="logout-all-password">{t('Nhập mật khẩu để xác nhận')}</Label>
              <Input id="logout-all-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          ) : null}
          <FormError message={error} />
          <Button type="submit" variant="destructive">
            {t('Đăng xuất mọi thiết bị')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
