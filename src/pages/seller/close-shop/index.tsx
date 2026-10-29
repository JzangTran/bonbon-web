import { Navigate } from 'react-router'
import { shopStatus, useShop } from '@/entities/shop'
import { Skeleton } from '@/shared/ui/skeleton'
import { FocusFrame } from '@/widgets/focus-frame'
import { CloseShopCard } from './close-shop-card'
import { merchantPath } from '@/shared/config/sites'
import { t } from '@/shared/i18n'

/** Closing the shop for good, on a page of its own (close-shop.md): nothing around it to click by mistake. */
export function CloseShopPage() {
  const shop = useShop()
  const status = shopStatus(shop.data)
  if (shop.data && status !== 'APPROVED') return <Navigate to={merchantPath()} replace />
  return (
    <FocusFrame title={t('Đóng cửa hàng')} exitTo={merchantPath('/shop')} flat>
      <h1 className="mb-4 text-2xl font-semibold">{t('Đóng cửa hàng')}</h1>
      {shop.isPending ? <Skeleton className="h-64" /> : <CloseShopCard />}
    </FocusFrame>
  )
}
