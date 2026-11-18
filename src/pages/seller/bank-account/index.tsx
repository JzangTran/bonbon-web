import { useShop } from '@/entities/shop'
import { problemMessage } from '@/shared/api'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { t } from '@/shared/i18n'
import { SepayCard } from './sepay-card'
import { ChangePayoutAccountDialog } from './change-account'
import { useState } from 'react'
import { useSession } from '@/entities/session'
import { Button } from '@/shared/ui/button'

/**
 * The account customers transfer to (VietQR) and bonbon pays the shop's balance into (settlement). The number is shown masked;
 * the shop account changes it here, after signing in again if its sign-in is older than ten minutes.
 */
export function SellerBankAccountPage() {
  const shop = useShop()
  const { session } = useSession()
  const canChange = (session?.permissions.has('vendor:create') ?? false) && !session?.team
  const [changing, setChanging] = useState(false)
  if (shop.isPending) return <Skeleton className="h-48 max-w-2xl" />
  if (shop.isError) return <FormError message={problemMessage(shop.error)} />
  const payout = shop.data.tax?.payout

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <h1 className="text-2xl font-semibold">{t('Tài khoản ngân hàng')}</h1>
      {payout ? (
        <dl className="grid grid-cols-[10rem_1fr] gap-x-6 gap-y-4">
          <dt className="text-muted-foreground">{t('Ngân hàng')}</dt>
          <dd className="font-medium">{payout.bankName}</dd>
          <dt className="text-muted-foreground">{t('Số tài khoản')}</dt>
          <dd className="font-medium tabular-nums">•••• {payout.accountLast4}</dd>
          <dt className="text-muted-foreground">{t('Chủ tài khoản')}</dt>
          <dd className="font-medium">{payout.accountHolderName}</dd>
          <dt className="text-muted-foreground">{t('Khớp với giấy tờ')}</dt>
          <dd className="font-medium">{payout.holderMatchesIdentity ? t('Tên chủ tài khoản khớp với giấy tờ tuỳ thân') : t('Tên chủ tài khoản chưa khớp với giấy tờ tuỳ thân')}</dd>
        </dl>
      ) : (
        <p className="text-muted-foreground">{t('Chưa có thông tin tài khoản nhận tiền.')}</p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-lg text-sm text-muted-foreground">
          {t('Khách chuyển khoản (VietQR) và bonbon chi trả số dư vào tài khoản này.')}
        </p>
        {/* only the shop account itself, never a main account or member */}
        {canChange ? (
          <Button variant="outline" onClick={() => setChanging(true)}>
            {payout ? t('Đổi tài khoản') : t('Thêm tài khoản')}
          </Button>
        ) : null}
      </div>
      {changing ? <ChangePayoutAccountDialog onClose={() => setChanging(false)} /> : null}
      <SepayCard />
    </div>
  )
}
