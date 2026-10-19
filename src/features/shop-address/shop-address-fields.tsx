import { CheckIcon, MapPinIcon } from 'lucide-react'
import { useState } from 'react'
import { useProvinces, useWards } from '@/entities/geo'
import { Button } from '@/shared/ui/button'
import { FormRow } from '@/shared/ui/form-row'
import { Textarea } from '@/shared/ui/textarea'
import { MapDialog, type PickedPoint } from './map-dialog'
import { UnitPicker } from './unit-picker'
import type { ShopAddressValue } from './validation'

/**
 * The shop's address as three rows: province and ward from one select, the detail the owner types, and the point confirmed on
 * the map. Changing the province or ward clears the point (it was for the old place); confirming a point on the map can
 * set the province and ward from what is under the pin, and fills the detail when it is still empty.
 */
export function ShopAddressFields({
  value,
  onChange,
  errors,
}: {
  value: ShopAddressValue
  onChange: (next: ShopAddressValue) => void
  errors: Record<string, string>
}) {
  const [mapOpen, setMapOpen] = useState(false)
  const provinces = useProvinces()
  const wards = useWards(value.provinceCode)
  const province = provinces.data?.find((p) => p.code === value.provinceCode)
  const ward = wards.data?.find((w) => w.code === value.wardCode)
  const located = value.lat !== undefined && value.lng !== undefined
  const unitsError = errors.provinceCode ?? errors.wardCode

  const confirm = ({ lat, lng, place }: PickedPoint) => {
    const next: ShopAddressValue = { ...value, lat, lng }
    if (place?.provinceCode !== undefined) {
      next.provinceCode = place.provinceCode
      next.wardCode = place.wardCode ?? (place.provinceCode === value.provinceCode ? value.wardCode : undefined)
    }
    if (next.detail.trim() === '' && place?.street) next.detail = place.street.slice(0, 200)
    onChange(next)
    setMapOpen(false)
  }

  return (
    <>
      <FormRow label="Tỉnh/Thành phố, Phường/Xã" htmlFor="shop-units" error={unitsError}>
        <UnitPicker
          id="shop-units"
          provinceCode={value.provinceCode}
          wardCode={value.wardCode}
          invalid={!!unitsError}
          describedBy={unitsError ? 'shop-units-error' : undefined}
          onChange={(provinceCode, wardCode) => onChange({ ...value, provinceCode, wardCode, lat: undefined, lng: undefined })}
        />
      </FormRow>
      <FormRow label="Địa chỉ chi tiết" htmlFor="shop-detail" error={errors.addressDetail}>
        <Textarea
          id="shop-detail"
          rows={2}
          maxLength={200}
          placeholder="Số nhà, tên đường, ..."
          value={value.detail}
          onChange={(e) => onChange({ ...value, detail: e.target.value })}
        />
      </FormRow>
      <FormRow label="Vị trí trên bản đồ" error={errors.location}>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" onClick={() => setMapOpen(true)}>
            <MapPinIcon /> Định vị
          </Button>
          {located ? (
            <span className="flex items-center gap-1.5 text-sm text-success-fg">
              <CheckIcon className="size-4" aria-hidden="true" />
              Đã định vị ({value.lat!.toFixed(5)}, {value.lng!.toFixed(5)})
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">Chưa định vị</span>
          )}
        </div>
      </FormRow>
      <MapDialog
        open={mapOpen}
        onOpenChange={setMapOpen}
        initial={located ? { lat: value.lat!, lng: value.lng! } : undefined}
        startQuery={[ward?.name, province?.name].filter(Boolean).join(', ') || undefined}
        onConfirm={confirm}
      />
    </>
  )
}
