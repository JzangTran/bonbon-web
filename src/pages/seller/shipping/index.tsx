import { useState } from 'react'
import { toast } from 'sonner'
import { parseAmount, useApplyShop, useShop, type ShopApplication } from '@/entities/shop'
import { OpeningHoursEditor, toEditorWindows, type OpeningWindow } from '@/features/opening-hours-editor'
import { api, problemMessage, type components } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'
import { t } from '@/shared/i18n'

type Update = components['schemas']['ShopProfileUpdateRequest']

/** Order intake, delivery radius and fee, and opening hours (pause-orders.md, edit-store-info.md). */
export function SellerShippingPage() {
  const shop = useShop()
  if (shop.isPending) return <Skeleton className="h-96 max-w-4xl" />
  if (shop.isError) return <FormError message={problemMessage(shop.error)} />
  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <h1 className="text-2xl font-semibold">{t('Cài đặt vận chuyển')}</h1>
      <IntakeCard shop={shop.data} />
      <ShippingCard key={`ship-${JSON.stringify(shop.data.shipping)}`} shop={shop.data} />
      <HoursCard key={`hours-${JSON.stringify(shop.data.shipping?.openingHours)}`} shop={shop.data} />
    </div>
  )
}

function IntakeCard({ shop }: { shop: ShopApplication }) {
  const toggle = useApplyShop(
    (accepting: boolean) => api.PUT('/api/merchant/shop/accepting-orders', { body: { accepting } }),
    t('Đã cập nhật trạng thái nhận đơn.'),
  )
  const accepting = shop.acceptingOrders ?? false
  return (
    <Card className={cn('ring-2', shop.openNow ? 'ring-success/60' : 'ring-transparent')}>
      <CardContent className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{shop.shop?.name}</span>
            {shop.status === 'PENDING' ? (
              <Badge className="bg-warning-subtle text-warning-fg">{t('Đang chờ duyệt lại')}</Badge>
            ) : shop.openNow ? (
              <Badge className="bg-success-subtle text-success-fg">{t('Đang mở · nhận đơn')}</Badge>
            ) : (
              <Badge variant="secondary">{t('Đang đóng')}</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {accepting
              ? t('Đang bật nhận đơn: cửa hàng mở trong các khung giờ đã đặt.')
              : t('Đang tạm ngưng: không nhận đơn mới, kể cả trong giờ mở cửa. Đơn đã nhận không bị huỷ.')}
          </p>
        </div>
        <Button
          variant={accepting ? 'outline' : 'default'}
          size="lg"
          disabled={toggle.isPending || shop.status !== 'APPROVED'}
          onClick={() => toggle.mutate(!accepting)}
        >
          {accepting ? t('Tạm ngưng nhận đơn') : t('Nhận đơn trở lại')}
        </Button>
      </CardContent>
    </Card>
  )
}

function ShippingCard({ shop }: { shop: ShopApplication }) {
  const s = shop.shipping
  const [radius, setRadius] = useState(s?.deliveryRadiusKm?.toString() ?? '')
  const [fee, setFee] = useState(s?.deliveryFee?.toString() ?? '')
  const [free, setFree] = useState(s?.freeDeliveryThreshold?.toString() ?? '')
  const [min, setMin] = useState(s?.minOrderValue?.toString() ?? '')
  const save = useApplyShop((body: Update) => api.PATCH('/api/merchant/shop', { body }), t('Đã lưu giao hàng.'))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Giao hàng')}</CardTitle>
        <CardDescription>{t('Áp dụng cho đơn đặt sau khi lưu; đơn cũ giữ nguyên.')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            // the same limits the server applies, said before the request
            const km = Number(radius)
            if (!/^\d{1,2}(\.\d)?$/.test(radius.trim()) || km < 0.1) return toast.error(t('Bán kính từ 0,1 km, tối đa một chữ số sau dấu phẩy.'))
            if (shop.maxDeliveryRadiusKm !== undefined && km > shop.maxDeliveryRadiusKm) return toast.error(t('Bán kính tối đa {v0} km.', { v0: shop.maxDeliveryRadiusKm }))
            if ((parseAmount(fee) ?? 0) > 1_000_000) return toast.error(t('Phí giao tối đa 1.000.000 ₫.'))
            save.mutate({
              deliveryRadiusKm: parseAmount(radius),
              deliveryFee: parseAmount(fee),
              freeDeliveryThreshold: parseAmount(free),
              minOrderValue: parseAmount(min),
              clearFreeDeliveryThreshold: free.trim() === '' ? true : undefined,
              clearMinOrderValue: min.trim() === '' ? true : undefined,
            })
          }}
        >
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="sh-radius">{t('Bán kính giao (km)')}</Label>
              <Input id="sh-radius" inputMode="decimal" maxLength={4} value={radius} onChange={(e) => setRadius(e.target.value.replace(',', '.').replace(/[^\d.]/g, ''))} />
              <p className="text-xs text-muted-foreground">{t('Tối đa ')}{shop.maxDeliveryRadiusKm} km.</p>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="sh-fee">{t('Phí giao hàng (₫)')}</Label>
              <Input id="sh-fee" inputMode="numeric" maxLength={7} value={fee} onChange={(e) => setFee(e.target.value.replace(/\D/g, ''))} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="sh-free">{t('Miễn phí giao từ (₫, để trống = không áp dụng)')}</Label>
              <Input id="sh-free" inputMode="numeric" maxLength={9} value={free} onChange={(e) => setFree(e.target.value.replace(/\D/g, ''))} />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="sh-min">{t('Đơn tối thiểu (₫, để trống = không áp dụng)')}</Label>
              <Input id="sh-min" inputMode="numeric" maxLength={9} value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))} />
            </div>
          </div>
          <Button type="submit" className="self-end" disabled={save.isPending || shop.status !== 'APPROVED'}>
            {t('Lưu giao hàng')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

function HoursCard({ shop }: { shop: ShopApplication }) {
  const [hours, setHours] = useState<OpeningWindow[]>(toEditorWindows(shop.shipping?.openingHours))
  const save = useApplyShop(
    (openingHours: OpeningWindow[]) => api.PUT('/api/merchant/shop/opening-hours', { body: { openingHours } }),
    t('Đã lưu giờ mở cửa.'),
  )
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('Giờ mở cửa')}</CardTitle>
        <CardDescription>{t('Giờ Việt Nam. Muốn dừng nhận đơn ngay mà không đổi lịch, dùng nút Tạm ngưng ở trên.')}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <OpeningHoursEditor value={hours} onChange={setHours} />
        <Button className="self-end" disabled={save.isPending || shop.status !== 'APPROVED'} onClick={() => save.mutate(hours)}>
          {t('Lưu giờ mở cửa')}
        </Button>
      </CardContent>
    </Card>
  )
}
