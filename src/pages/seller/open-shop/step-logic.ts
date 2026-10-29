import { t } from '@/shared/i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { SHOP_QUERY_KEY, type ShopApplication } from '@/entities/shop'
import { problemFieldErrors } from '@/shared/api'
import type { Errors } from '@/shared/lib/validate'

export const STEPS = [t('Thông tin quán'), t('Giao hàng và thời gian'), t('Thuế & nhận tiền'), t('Định danh'), t('Xác nhận')] as const

export const FIELD_LABEL: Record<string, string> = {
  name: t('Tên cửa hàng'),
  phone: t('Số điện thoại'),
  email: 'Email',
  province: t('Tỉnh/Thành phố'),
  ward: t('Phường/Xã'),
  addressDetail: t('Địa chỉ chi tiết'),
  location: t('Vị trí trên bản đồ'),
  serviceArea: t('Khu vực phục vụ'),
  openingHours: t('Giờ mở cửa'),
  deliveryRadiusKm: t('Bán kính giao'),
  deliveryFee: t('Phí giao hàng'),
  businessType: t('Loại hình kinh doanh'),
  businessAddress: t('Địa chỉ kinh doanh'),
  taxCode: t('Mã số thuế'),
  invoiceEmails: t('Email nhận hoá đơn'),
  businessName: t('Tên hộ kinh doanh'),
  businessLicense: t('Giấy phép kinh doanh'),
  bankName: t('Ngân hàng'),
  accountNumber: t('Số tài khoản'),
  accountHolderName: t('Chủ tài khoản'),
  docType: t('Loại giấy tờ'),
  docNumber: t('Số giấy tờ'),
  fullName: t('Họ tên trên giấy tờ'),
  frontPhoto: t('Ảnh mặt trước'),
  selfiePhoto: t('Ảnh cầm giấy tờ'),
  accuracyConfirmed: t('Cam kết thông tin chính xác'),
  sellerTerms: t('Điều khoản người bán'),
  identityConsent: t('Đồng ý xử lý dữ liệu định danh'),
}

/**
 * Saving one step. The person's mistakes are caught at the field first (`check`, the same rules as the backend), then what the
 * server still refuses comes back by field. `errors` is both, client first.
 */
export function useStep<T>(save: (body: T) => Promise<{ data?: ShopApplication; error?: unknown }>) {
  const queryClient = useQueryClient()
  const [serverErrors, setServerErrors] = useState<Errors>({})
  const [clientErrors, setClientErrors] = useState<Errors>({})
  const mutation = useMutation({
    mutationFn: async (body: T) => {
      const { data, error } = await save(body)
      if (error || !data) throw error
      return data
    },
    onSuccess: (data) => {
      setServerErrors({})
      setClientErrors({})
      queryClient.setQueryData(SHOP_QUERY_KEY, data)
    },
    onError: (e) => setServerErrors(problemFieldErrors(e)),
  })
  /** True when nothing is wrong; otherwise marks the fields and says so. */
  const check = (found: Errors) => {
    setClientErrors(found)
    setServerErrors({})
    const ok = Object.keys(found).length === 0
    if (!ok) toast.error(t('Vui lòng kiểm tra các trường được đánh dấu.'))
    return ok
  }
  return { ...mutation, errors: { ...serverErrors, ...clientErrors } as Errors, check }
}

/** A number as typed in Vietnam ("1.500", "2,5"); undefined when empty, NaN when it is not a number. */
export const num = (s: string) => (s.trim() === '' ? undefined : Number(s.trim().replace(/\./g, '').replace(',', '.')))
export const str = (s: string) => (s.trim() === '' ? undefined : s.trim())

export type UploadKind = 'business-license' | 'identity-front' | 'identity-selfie'
