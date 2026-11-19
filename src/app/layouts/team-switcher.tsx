import { CheckIcon, ChevronsUpDownIcon, UsersRoundIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useFeedback } from '@/shared/ui/feedback'
import { teamOf, useSession, type Role } from '@/entities/session'
import { api} from '@/shared/api'
import { merchantPath } from '@/shared/config/sites'
import { t } from '@/shared/i18n'
import { Button } from '@/shared/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/shared/ui/dropdown-menu'

/**
 * The shop a main account or member is working on, with the others it may open (seller-team). Like the store switcher of Shopify or
 * the account switcher of Seller Center: one click, a new token for that shop, and the page starts over there. A main account can
 * also go back to the team console.
 */
export function TeamSwitcher() {
  const feedback = useFeedback()
  const { session, signIn } = useSession()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const team = session?.team
  if (!team || !session) return null

  const open = async (vendorId: string | null) => {
    if (busy || vendorId === team.shopId) return
    setBusy(true)
    const { data, error } = await api.POST('/api/seller-team/switch-shop', { body: { vendorId: vendorId ?? undefined } })
    setBusy(false)
    if (error || !data?.accessToken || !data.user) {
      feedback.error(error)
      return
    }
    signIn({
      accessToken: data.accessToken,
      userId: data.user.id ?? session.userId,
      email: '',
      name: data.user.name ?? session.name,
      role: 'SELLER' as Role,
      availableRoles: ['SELLER'],
      team: teamOf((data.user as { team?: unknown }).team),
    })
    navigate(vendorId ? merchantPath() : merchantPath('/team'), { replace: true })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="max-w-56 gap-2" disabled={busy} aria-label={t('Đổi cửa hàng')}>
          <span className="truncate">{team.shopName ?? t('Quản lý nhóm')}</span>
          <ChevronsUpDownIcon className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-caption font-normal text-muted-foreground">{team.login}</DropdownMenuLabel>
        {team.kind === 'MAIN_ACCOUNT' ? (
          <DropdownMenuItem onSelect={() => void open(null)}>
            <UsersRoundIcon className="size-4" aria-hidden="true" />
            <span className="flex-1">{t('Quản lý nhóm')}</span>
            {team.shopId === null ? <CheckIcon className="size-4" aria-hidden="true" /> : null}
          </DropdownMenuItem>
        ) : null}
        {team.shops.length ? <DropdownMenuSeparator /> : null}
        {team.shops.map((s) => (
          <DropdownMenuItem key={s.vendorId} onSelect={() => void open(s.vendorId)}>
            <span className="flex-1 truncate">{s.name}</span>
            {s.status !== 'APPROVED' ? <span className="text-caption text-muted-foreground">{t('Tạm khoá')}</span> : null}
            {team.shopId === s.vendorId ? <CheckIcon className="size-4" aria-hidden="true" /> : null}
          </DropdownMenuItem>
        ))}
        {!team.shops.length ? <p className="px-2 py-1.5 text-body-sm text-muted-foreground">{t('Chưa có cửa hàng nào.')}</p> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
