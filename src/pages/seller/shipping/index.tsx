import { useState } from 'react'
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

type Update = components['schemas']['ShopProfileUpdateRequest']

/** Order intake, delivery radius and fee, and opening hours (pause-orders.md, edit-store-info.md). */
export function SellerShippingPage() {
  const shop = useShop()
  if (shop.isPending) return <Skeleton className="h-96 max-w-4xl" />
  if (shop.isError) return <FormError message={problemMessage(shop.error)} />
  return (
    <div className="flex max-w-4xl flex-col gap-10">
      <h1 className="text-2xl font-semibold">Cài đặt vận chuyển</h1>
      <IntakeCard shop={shop.data} />
      <ShippingCard key={`ship-${JSON.stringify(shop.data.shipping)}`} shop={shop.data} />
      <HoursCard key={`hours-${JSON.stringify(shop.data.shipping?.openingHours)}`} shop={shop.data} />
    </div>
  )
}

function IntakeCard({ shop }: { shop: ShopApplication }) {
  const toggle = useApplyShop(
    (accepting: boolean) => api.PUT('/api/merchant/shop/accepting-orders', { body: { accepting } }),
    'Đã cập nhật trạng thái nhận đơn.',
  )
  const accepting = shop.acceptingOrders ?? false
  return (
    <Card className={cn('ring-2', shop.openNow ? 'ring-success/60' : 'ring-transparent')}>
      <CardContent className="flex flex-wrap items-center gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{shop.shop?.name}</span>
            {shop.status === 'PENDING' ? (
              <Badge className="bg-warning-subtle text-warning-fg">Đang chờ duyệt lại</Badge>
            ) : shop.openNow ? (
              <Badge className="bg-success-subtle text-success-fg">Đang mở · nhận đơn</Badge>
            ) : (
              <Badge variant="secondary">Đang đóng</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {accepting
              ? 'Đang bật nhận đơn: cửa hàng mở trong các khung giờ đã đặt.'
              : 'Đang tạm ngưng: không nhận đơn mới, kể cả trong giờ mở cửa. Đơn đã nhận không bị huỷ.'}
          </p>
        </div>
        <Button
          variant={accepting ? 'outline' : 'default'}
          size="lg"
          disabled={toggle.isPending || shop.status !== 'APPROVED'}
          onClick={() => toggle.mutate(!accepting)}
        >
          {accepting ? 'Tạm ngưng nhận đơn' : 'Nhận đơn trở lại'}
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
  const save = useApplyShop((body: Update) => api.PATCH('/api/merchant/shop', { body }), 'Đã lưu giao hàng.')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Giao hàng</CardTitle>
        <CardDescription>Áp dụng cho đơn đặt sau khi lưu; đơn cũ giữ nguyên.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
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
              <Label htmlFor="sh-radius">Bán kính giao (km)</Label>
              <Input id="sh-radius" inputMode="decimal" value={radius} onChange={(e) => setRadius(e.target.value)} />
              <p className="text-xs text-muted-foreground">Tối đa {shop.maxDeliveryRadiusKm} km.</p>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="sh-fee">Phí giao hàng (₫)</Label>
              <Input id="sh-fee" inputMode="numeric" value={fee} onChange={(e) => setFee(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="sh-free">Miễn phí giao từ (₫, để trống = không áp dụng)</Label>
              <Input id="sh-free" inputMode="numeric" value={free} onChange={(e) => setFree(e.target.value)} />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="sh-min">Đơn tối thiểu (₫, để trống = không áp dụng)</Label>
              <Input id="sh-min" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="self-end" disabled={save.isPending || shop.status !== 'APPROVED'}>
            Lưu giao hàng
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
    'Đã lưu giờ mở cửa.',
  )
  return (
    <Card>
      <CardHeader>
        <CardTitle>Giờ mở cửa</CardTitle>
        <CardDescription>Giờ Việt Nam. Muốn dừng nhận đơn ngay mà không đổi lịch, dùng nút Tạm ngưng ở trên.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <OpeningHoursEditor value={hours} onChange={setHours} />
        <Button className="self-end" disabled={save.isPending || shop.status !== 'APPROVED'} onClick={() => save.mutate(hours)}>
          Lưu giờ mở cửa
        </Button>
      </CardContent>
    </Card>
  )
}
