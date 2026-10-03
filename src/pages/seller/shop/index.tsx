import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SHOP_QUERY_KEY, useShop, type ShopApplication } from '@/entities/shop'
import { AddressPicker } from '@/features/address-picker'
import { OpeningHoursEditor, toEditorWindows, type OpeningWindow } from '@/features/opening-hours-editor'
import { api, problemFieldErrors, problemMessage, type components } from '@/shared/api'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

type Update = components['schemas']['ShopProfileUpdateRequest']

const num = (s: string) => (s.trim() === '' ? undefined : Number(s.replace(/\./g, '').replace(',', '.')))

function useApply<T>(call: (input: T) => Promise<{ data?: ShopApplication; error?: unknown }>, success: string) {
  const queryClient = useQueryClient()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const mutation = useMutation({
    mutationFn: async (input: T) => {
      const { data, error } = await call(input)
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      setFieldErrors({})
      queryClient.setQueryData(SHOP_QUERY_KEY, data)
      toast.success(data.status === 'PENDING' ? 'Đã lưu. Địa chỉ mới cần được duyệt lại.' : success)
    },
    onError: (e) => {
      setFieldErrors(problemFieldErrors(e))
      toast.error(problemMessage(e))
    },
  })
  return { ...mutation, fieldErrors }
}

/**
 * An approved shop's details, schedule and order intake (edit-store-info.md, pause-orders.md). A new address
 * sends the shop back to review; everything else applies at once.
 */
export function SellerShopPage() {
  const shop = useShop()
  if (shop.isPending) return <Skeleton className="h-96 max-w-4xl" />
  if (shop.isError) return <FormError message={problemMessage(shop.error)} />
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Cửa hàng</h1>
      <IntakeCard shop={shop.data} />
      <InfoCard key={`info-${shop.data.shop?.name}-${shop.data.shop?.address?.placeId}`} shop={shop.data} />
      <ShippingCard key={`ship-${JSON.stringify(shop.data.shipping)}`} shop={shop.data} />
      <HoursCard key={`hours-${JSON.stringify(shop.data.shipping?.openingHours)}`} shop={shop.data} />
    </div>
  )
}

function IntakeCard({ shop }: { shop: ShopApplication }) {
  const toggle = useApply(
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

function InfoCard({ shop }: { shop: ShopApplication }) {
  const [name, setName] = useState(shop.shop?.name ?? '')
  const [phone, setPhone] = useState(shop.shop?.phone ?? '')
  const [email, setEmail] = useState(shop.shop?.email ?? '')
  const [detail, setDetail] = useState(shop.shop?.address?.detail ?? '')
  const [placeId, setPlaceId] = useState<string | undefined>()
  const save = useApply((body: Update) => api.PATCH('/api/merchant/shop', { body }), 'Đã lưu thông tin cửa hàng.')
  const disabled = save.isPending || shop.status !== 'APPROVED'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cửa hàng</CardTitle>
        <CardDescription>Tên và liên hệ áp dụng ngay. Đổi địa chỉ thì cửa hàng tạm ẩn cho tới khi được duyệt lại.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (placeId && !window.confirm('Đổi địa chỉ sẽ đưa cửa hàng về trạng thái chờ duyệt và tạm ngừng nhận đơn. Tiếp tục?')) return
            save.mutate({ name: name.trim(), phone: phone.trim(), email: email.trim(), addressDetail: detail, placeId })
          }}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="info-name">Tên cửa hàng</Label>
            <Input id="info-name" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
            {save.fieldErrors.name ? <p className="text-sm text-destructive">{save.fieldErrors.name}</p> : null}
          </div>
          <AddressPicker label="Địa chỉ" current={shop.shop?.address?.formattedAddress} onPick={(p) => setPlaceId(p.placeId)} />
          {placeId ? (
            <p className="flex items-center gap-2 rounded-md bg-warning-subtle px-3 py-2 text-sm text-warning-fg">
              <TriangleAlertIcon className="size-4 shrink-0" /> Lưu địa chỉ mới sẽ gửi cửa hàng đi duyệt lại.
            </p>
          ) : null}
          <div className="flex flex-col gap-2">
            <Label htmlFor="info-detail">Địa chỉ chi tiết</Label>
            <Input id="info-detail" maxLength={200} value={detail} onChange={(e) => setDetail(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="info-phone">Số điện thoại</Label>
              <Input id="info-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              {save.fieldErrors.phone ? <p className="text-sm text-destructive">{save.fieldErrors.phone}</p> : null}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="info-email">Email</Label>
              <Input id="info-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <Button type="submit" className="self-end" disabled={disabled}>
            Lưu thông tin
          </Button>
        </form>
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
  const save = useApply((body: Update) => api.PATCH('/api/merchant/shop', { body }), 'Đã lưu giao hàng.')

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
              deliveryRadiusKm: num(radius),
              deliveryFee: num(fee),
              freeDeliveryThreshold: num(free),
              minOrderValue: num(min),
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
  const save = useApply(
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
