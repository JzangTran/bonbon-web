import { useState } from 'react'
import { toast } from 'sonner'
import type { ShopApplication } from '@/entities/shop'
import { OpeningHoursEditor, toEditorWindows, type OpeningWindow } from '@/features/opening-hours-editor'
import { api, problemMessage } from '@/shared/api'
import type { Errors } from '@/shared/lib/validate'
import { FormRow } from '@/shared/ui/form-row'
import { Input } from '@/shared/ui/input'
import { FormError } from '@/widgets/auth-shell'
import { Field, SaveButtons, StepCard } from './step-kit'
import { num, useStep } from './step-logic'

type Body = {
  openingHours: OpeningWindow[]
  deliveryRadiusKm?: number
  deliveryFee?: number
  freeDeliveryThreshold?: number
  minOrderValue?: number
}

/** A whole number of dong between 0 and `max` when something was typed. */
function money(e: Errors, field: string, value: number | undefined, label: string, max: number) {
  if (value === undefined) return
  if (Number.isNaN(value) || !Number.isInteger(value) || value < 0) e[field] = `${label} phải là số tiền (đồng), không âm.`
  else if (value > max) e[field] = `${label} tối đa ${max.toLocaleString('vi-VN')} ₫.`
}

/** Step 2 · Giao hàng và thời gian. */
export function ShippingStep({ shop, onNext }: { shop: ShopApplication; onNext: () => void }) {
  const s = shop.shipping
  const [hours, setHours] = useState<OpeningWindow[]>(toEditorWindows(s?.openingHours))
  const [radius, setRadius] = useState(s?.deliveryRadiusKm?.toString() ?? '')
  const [fee, setFee] = useState(s?.deliveryFee?.toString() ?? '')
  const [free, setFree] = useState(s?.freeDeliveryThreshold?.toString() ?? '')
  const [min, setMin] = useState(s?.minOrderValue?.toString() ?? '')
  const save = useStep((body: Body) => api.PUT('/api/merchant/shop/steps/2', { body }))
  const cap = shop.maxDeliveryRadiusKm
  const area = shop.serviceArea

  const problems = (strict: boolean): Errors => {
    const e: Errors = {}
    if (strict && hours.length === 0) e.openingHours = 'Hãy đặt giờ mở cửa cho ít nhất một ngày.'
    const r = num(radius)
    if (r === undefined) {
      if (strict) e.deliveryRadiusKm = 'Hãy nhập bán kính giao.'
    } else if (Number.isNaN(r) || r < 0.1) e.deliveryRadiusKm = 'Bán kính giao từ 0,1 km.'
    else if (cap !== undefined && r > cap) e.deliveryRadiusKm = `Bán kính giao tối đa ${cap} km.`
    const f = num(fee)
    if (f === undefined && strict) e.deliveryFee = 'Hãy nhập phí giao hàng (0 nếu miễn phí).'
    money(e, 'deliveryFee', f, 'Phí giao hàng', 1_000_000)
    money(e, 'freeDeliveryThreshold', num(free), 'Mức miễn phí giao', 100_000_000)
    money(e, 'minOrderValue', num(min), 'Đơn tối thiểu', 100_000_000)
    return e
  }

  const submit = (andNext: boolean) => {
    if (!save.check(problems(andNext))) return
    save.mutate(
      { openingHours: hours, deliveryRadiusKm: num(radius), deliveryFee: num(fee), freeDeliveryThreshold: num(free), minOrderValue: num(min) },
      { onSuccess: () => (andNext ? onNext() : toast.success('Đã lưu nháp.')) },
    )
  }

  return (
    <StepCard
      title="2 · Giao hàng và thời gian"
      description="Giờ Việt Nam. Phí giao hàng là doanh thu của cửa hàng (không có tài xế riêng)."
      footer={<SaveButtons pending={save.isPending} onSave={submit} />}
    >
      <FormRow label="Khu vực phục vụ" hint="Tính theo vị trí quán ở bước 1; khu vực quyết định bán kính giao tối đa.">
        {area ? (
          <p className="flex min-h-9 items-center text-sm font-medium">{area.name}</p>
        ) : (
          <p className="flex min-h-9 items-center text-sm text-destructive">Chưa xác định. Hãy quay lại bước 1 và định vị quán.</p>
        )}
      </FormRow>
      <Field id="ship-radius" label="Bán kính giao (km)" required hint={`Tối đa ${cap} km${area ? ` ở ${area.name}` : ''}, tính đường chim bay từ cửa hàng.`} error={save.errors.deliveryRadiusKm}>
        <Input id="ship-radius" inputMode="decimal" maxLength={5} value={radius} onChange={(e) => setRadius(e.target.value)} />
      </Field>
      <Field id="ship-fee" label="Phí giao hàng (₫)" required hint="0 = miễn phí." error={save.errors.deliveryFee}>
        <Input id="ship-fee" inputMode="numeric" maxLength={9} value={fee} onChange={(e) => setFee(e.target.value)} />
      </Field>
      <Field id="ship-free" label="Miễn phí giao từ (₫, tuỳ chọn)" error={save.errors.freeDeliveryThreshold}>
        <Input id="ship-free" inputMode="numeric" maxLength={11} value={free} onChange={(e) => setFree(e.target.value)} />
      </Field>
      <Field id="ship-min" label="Đơn tối thiểu (₫, tuỳ chọn)" error={save.errors.minOrderValue}>
        <Input id="ship-min" inputMode="numeric" maxLength={11} value={min} onChange={(e) => setMin(e.target.value)} />
      </Field>
      <FormRow label="Giờ mở cửa" required error={save.errors.openingHours} className="md:[&>div]:max-w-none">
        <OpeningHoursEditor value={hours} onChange={setHours} />
      </FormRow>
      {save.isError ? <FormError message={problemMessage(save.error)} /> : null}
    </StepCard>
  )
}
