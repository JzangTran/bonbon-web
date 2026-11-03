import { useQuery } from '@tanstack/react-query'
import { StoreIcon } from 'lucide-react'
import { useParams } from 'react-router'
import { api } from '@/shared/api'
import { siteUrl } from '@/shared/config/sites'
import { t } from '@/shared/i18n'
import { Lockup } from '@/shared/ui/brand'
import { LanguageSwitch } from '@/shared/ui/language-switch'
import { StoreButtons } from '@/shared/ui/store-buttons'

/**
 * Where a shop's QR code lands when it is scanned with the phone's camera instead of the bonbon app: the shop's name and logo, and
 * the way to the app, where its menu opens. Scanned inside the app, the code goes straight to the menu.
 */
export function ShopLinkPage() {
  const { id = '' } = useParams()
  const shop = useQuery({
    queryKey: ['shop-link', id],
    retry: false,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/vendors/{id}/menu', { params: { path: { id } } })
      if (error || !data) throw error
      return data.shop
    },
  })
  return (
    <div className="flex min-h-svh flex-col bg-white text-ink">
      <header className="flex h-16 items-center justify-between px-5 sm:px-8">
        <a href={siteUrl('public')} aria-label={t('bonbon, trang chủ')}>
          <Lockup className="h-7" />
        </a>
        <LanguageSwitch compact />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 px-6 pb-12 text-center">
        <div className="flex size-24 items-center justify-center overflow-hidden rounded-2xl bg-grey-100">
          {shop.data?.logoUrl ? <img src={shop.data.logoUrl} alt="" className="size-full object-cover" /> : <StoreIcon className="size-10 text-muted-foreground" aria-hidden="true" />}
        </div>
        <h1 className="text-[1.75rem] leading-tight font-semibold text-balance">
          {shop.data?.name ?? (shop.isError ? t('Không tìm thấy quán') : '…')}
        </h1>
        <p className="text-body text-muted-foreground text-balance">
          {shop.isError
            ? t('Quán này không còn bán trên bonbon, hoặc mã QR không đúng.')
            : t('Mở ứng dụng bonbon và bấm nút quét mã ở trang chủ để xem thực đơn và đặt món của quán.')}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <StoreButtons />
        </div>
      </main>
    </div>
  )
}
