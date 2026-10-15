import { TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import { useApplyShop, useShop, type ShopApplication } from '@/entities/shop'
import { AddressPicker } from '@/features/address-picker'
import { api, problemMessage, type components } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { DangerLinkCard } from '@/shared/ui/danger-link-card'
import { Skeleton } from '@/shared/ui/skeleton'
import { FormError } from '@/widgets/auth-shell'

type Update = components['schemas']['ShopProfileUpdateRequest']

/**
 * An approved shop's details (edit-store-info.md). A new address sends the shop back to review; everything else
 * applies at once. Delivery settings and order intake live in the shipping page.
 */
export function SellerShopPage() {
  const shop = useShop()
  if (shop.isPending) return <Skeleton className="h-96 max-w-4xl" />
  if (shop.isError) return <FormError message={problemMessage(shop.error)} />
  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <h1 className="text-2xl font-bold">Hồ sơ cửa hàng</h1>
      <InfoCard key={`info-${shop.data.shop?.name}-${shop.data.shop?.address?.placeId}`} shop={shop.data} />
      <DangerLinkCard
        title="Đóng cửa hàng"
        description="Đóng hẳn cửa hàng, không mở lại được. Muốn bán lại phải mở một cửa hàng mới."
        to="/focus/close-shop"
        action="Đóng cửa hàng"
      />
    </div>
  )
}

function InfoCard({ shop }: { shop: ShopApplication }) {
  const [name, setName] = useState(shop.shop?.name ?? '')
  const [phone, setPhone] = useState(shop.shop?.phone ?? '')
  const [email, setEmail] = useState(shop.shop?.email ?? '')
  const [detail, setDetail] = useState(shop.shop?.address?.detail ?? '')
  const [placeId, setPlaceId] = useState<string | undefined>()
  const save = useApplyShop((body: Update) => api.PATCH('/api/merchant/shop', { body }), 'Đã lưu thông tin cửa hàng.')
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
            {save.fieldErrors.name ? <p role="alert" className="text-sm text-destructive">{save.fieldErrors.name}</p> : null}
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
              {save.fieldErrors.phone ? <p role="alert" className="text-sm text-destructive">{save.fieldErrors.phone}</p> : null}
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
