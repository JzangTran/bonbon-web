import { t } from '@/shared/i18n'
import { useState } from 'react'
import { toast } from 'sonner'
import type { ShopApplication } from '@/entities/shop'
import { ShopAddressFields, validateShopAddress, type ShopAddressValue } from '@/features/shop-address'
import { api, problemMessage } from '@/shared/api'
import { VN_PHONE, compactPhone, isEmail, requiredText, type Errors } from '@/shared/lib/validate'
import { Input } from '@/shared/ui/input'
import { FormError } from '@/widgets/auth-shell'
import { Field, SaveButtons, StepCard } from './step-kit'
import { str, useStep } from './step-logic'

type Body = {
  name?: string
  phone?: string
  email?: string
  provinceCode?: number
  wardCode?: number
  addressDetail?: string
  lat?: number
  lng?: number
}

/** Step 1 · Thông tin quán: name, address (province and ward, detail, map point), Vietnamese phone, email. */
export function ShopInfoStep({ shop, onNext }: { shop: ShopApplication; onNext: () => void }) {
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
  const save = useStep((body: Body) => api.PUT('/api/merchant/shop/steps/1', { body }))

  /** `strict`: the step is being completed, so every part is needed; a draft only has to be well formed. */
  const problems = (strict: boolean): Errors => {
    const e: Errors = {}
    if (strict || name.trim() !== '') requiredText(e, 'name', name, t('tên cửa hàng'), 100)
    const p = compactPhone(phone)
    if (strict && p === '') e.phone = t('Hãy nhập số điện thoại cửa hàng.')
    else if (p !== '' && !VN_PHONE.test(p)) e.phone = t('Số điện thoại Việt Nam không hợp lệ, ví dụ 0912345678 hoặc +84912345678.')
    if (strict && email.trim() === '') e.email = t('Hãy nhập email cửa hàng.')
    else if (email.trim() !== '' && !isEmail(email.trim())) e.email = t('Email không hợp lệ.')
    return { ...e, ...validateShopAddress(address, strict) }
  }

  const submit = (andNext: boolean) => {
    if (!save.check(problems(andNext))) return
    save.mutate(
      {
        name: str(name),
        phone: str(compactPhone(phone)),
        email: str(email),
        provinceCode: address.provinceCode,
        wardCode: address.wardCode,
        addressDetail: str(address.detail),
        lat: address.lat,
        lng: address.lng,
      },
      { onSuccess: () => (andNext ? onNext() : toast.success(t('Đã lưu nháp.'))) },
    )
  }

  return (
    <StepCard title={t('1 · Thông tin quán')} footer={<SaveButtons pending={save.isPending} onSave={submit} />}>
      <Field id="shop-name" label={t('Tên cửa hàng')} required error={save.errors.name}>
        <Input id="shop-name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <ShopAddressFields value={address} onChange={setAddress} errors={save.errors} />
      <Field id="shop-phone" label={t('Số điện thoại cửa hàng')} required hint={t('Số điện thoại Việt Nam, ví dụ 0912345678.')} error={save.errors.phone}>
        <Input id="shop-phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={15} placeholder="0912345678" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Field id="shop-email" label={t('Email cửa hàng')} required error={save.errors.email}>
        <Input id="shop-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      {save.isError ? <FormError message={problemMessage(save.error)} /> : null}
    </StepCard>
  )
}
