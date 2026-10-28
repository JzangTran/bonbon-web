import { TriangleAlertIcon } from 'lucide-react'
import { useState } from 'react'
import { useApplyShop, useShop, type ShopApplication } from '@/entities/shop'
import { ShopAddressFields, validateShopAddress, type ShopAddressValue } from '@/features/shop-address'
import { api, problemMessage, type components } from '@/shared/api'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { FormRow } from '@/shared/ui/form-row'
import { VN_PHONE, compactPhone, isEmail, requiredText, type Errors } from '@/shared/lib/validate'
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
    <div className="flex max-w-4xl flex-col gap-10">
      <h1 className="text-2xl font-semibold">Hồ sơ cửa hàng</h1>
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
  const a = shop.shop?.address
  const [name, setName] = useState(shop.shop?.name ?? '')
  const [phone, setPhone] = useState(shop.shop?.phone ?? '')
  const [email, setEmail] = useState(shop.shop?.email ?? '')
  const [address, setAddress] = useState<ShopAddressValue>({
    provinceCode: a?.provinceCode ?? undefined,
    wardCode: a?.wardCode ?? undefined,
    detail: a?.detail ?? '',
    lat: a?.lat ?? undefined,
    lng: a?.lng ?? undefined,
  })
  const [problems, setProblems] = useState<Errors>({})
  const save = useApplyShop((body: Update) => api.PATCH('/api/merchant/shop', { body }), 'Đã lưu thông tin cửa hàng.')
  const disabled = save.isPending || shop.status !== 'APPROVED'
  const errors = { ...save.fieldErrors, ...problems }
  /** A new place (province, ward or map point) sends the shop back to review; the detail alone does not. */
  const moves = address.provinceCode !== (a?.provinceCode ?? undefined) || address.wardCode !== (a?.wardCode ?? undefined) || address.lat !== (a?.lat ?? undefined) || address.lng !== (a?.lng ?? undefined)

  const submit = () => {
    const found: Errors = {}
    requiredText(found, 'name', name, 'tên cửa hàng', 100)
    const p = compactPhone(phone)
    if (p === '') found.phone = 'Hãy nhập số điện thoại cửa hàng.'
    else if (!VN_PHONE.test(p)) found.phone = 'Số điện thoại Việt Nam không hợp lệ, ví dụ 0912345678 hoặc +84912345678.'
    if (!isEmail(email.trim())) found.email = 'Email không hợp lệ.'
    Object.assign(found, validateShopAddress(address, true))
    setProblems(found)
    if (Object.keys(found).length > 0) return
    if (moves && !window.confirm('Đổi địa chỉ sẽ đưa cửa hàng về trạng thái chờ duyệt và tạm ngừng nhận đơn. Tiếp tục?')) return
    save.mutate({
      name: name.trim(),
      phone: p,
      email: email.trim(),
      addressDetail: address.detail.trim(),
      ...(moves ? { provinceCode: address.provinceCode, wardCode: address.wardCode, lat: address.lat, lng: address.lng } : {}),
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cửa hàng</CardTitle>
        <CardDescription>Tên và liên hệ áp dụng ngay. Đổi địa chỉ thì cửa hàng tạm ẩn cho tới khi được duyệt lại.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-5"
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <FormRow label="Tên cửa hàng" required htmlFor="info-name" error={errors.name}>
            <Input id="info-name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
          </FormRow>
          <ShopAddressFields value={address} onChange={setAddress} errors={errors} />
          {moves ? (
            <p className="flex items-center gap-2 rounded-sm bg-warning-subtle px-3 py-2 text-sm text-warning-fg">
              <TriangleAlertIcon className="size-4 shrink-0" /> Lưu địa chỉ mới sẽ gửi cửa hàng đi duyệt lại.
            </p>
          ) : null}
          <FormRow label="Số điện thoại" required htmlFor="info-phone" hint="Số điện thoại Việt Nam, ví dụ 0912345678." error={errors.phone}>
            <Input id="info-phone" type="tel" inputMode="tel" maxLength={15} placeholder="0912345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </FormRow>
          <FormRow label="Email" required htmlFor="info-email" error={errors.email}>
            <Input id="info-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormRow>
          <Button type="submit" className="self-end" disabled={disabled}>
            Lưu thông tin
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
