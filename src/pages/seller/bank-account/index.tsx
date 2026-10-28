import { useShop } from '@/entities/shop'
import { problemMessage } from '@/shared/api'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

/**
 * The account bonbon pays the shop's balance into (settlement). Read-only: the number is shown masked and changing it
 * is not available yet, so a shop that needs another account contacts support.
 */
export function SellerBankAccountPage() {
  const shop = useShop()
  if (shop.isPending) return <Skeleton className="h-48 max-w-2xl" />
  if (shop.isError) return <FormError message={problemMessage(shop.error)} />
  const payout = shop.data.tax?.payout

  return (
    <div className="flex max-w-2xl flex-col gap-10">
      <h1 className="text-2xl font-semibold">Tài khoản ngân hàng</h1>
      {payout ? (
        <dl className="grid grid-cols-[10rem_1fr] gap-x-6 gap-y-4">
          <dt className="text-muted-foreground">Ngân hàng</dt>
          <dd className="font-medium">{payout.bankName}</dd>
          <dt className="text-muted-foreground">Số tài khoản</dt>
          <dd className="font-medium tabular-nums">•••• {payout.accountLast4}</dd>
          <dt className="text-muted-foreground">Chủ tài khoản</dt>
          <dd className="font-medium">{payout.accountHolderName}</dd>
          <dt className="text-muted-foreground">Khớp với giấy tờ</dt>
          <dd className="font-medium">{payout.holderMatchesIdentity ? 'Tên chủ tài khoản khớp với giấy tờ tuỳ thân' : 'Tên chủ tài khoản chưa khớp với giấy tờ tuỳ thân'}</dd>
        </dl>
      ) : (
        <p className="text-muted-foreground">Chưa có thông tin tài khoản nhận tiền.</p>
      )}
      <p className="text-sm text-muted-foreground">
        Số dư của cửa hàng được chuyển vào tài khoản này. Hiện chưa đổi được tài khoản trên trang này; nếu cần đổi, hãy gửi yêu cầu qua mục Liên hệ hỗ trợ trong menu tài khoản.
      </p>
    </div>
  )
}
