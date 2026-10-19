import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { SHOP_QUERY_KEY, type ShopApplication } from '@/entities/shop'
import { problemFieldErrors } from '@/shared/api'
import type { Errors } from '@/shared/lib/validate'

export const STEPS = ['Thông tin quán', 'Giao hàng và thời gian', 'Thuế & nhận tiền', 'Định danh', 'Xác nhận'] as const

export const FIELD_LABEL: Record<string, string> = {
  name: 'Tên cửa hàng',
  phone: 'Số điện thoại',
  email: 'Email',
  province: 'Tỉnh/Thành phố',
  ward: 'Phường/Xã',
  addressDetail: 'Địa chỉ chi tiết',
  location: 'Vị trí trên bản đồ',
  serviceArea: 'Khu vực phục vụ',
  openingHours: 'Giờ mở cửa',
  deliveryRadiusKm: 'Bán kính giao',
  deliveryFee: 'Phí giao hàng',
  businessType: 'Loại hình kinh doanh',
  businessAddress: 'Địa chỉ kinh doanh',
  taxCode: 'Mã số thuế',
  invoiceEmails: 'Email nhận hoá đơn',
  businessName: 'Tên hộ kinh doanh',
  businessLicense: 'Giấy phép kinh doanh',
  bankName: 'Ngân hàng',
  accountNumber: 'Số tài khoản',
  accountHolderName: 'Chủ tài khoản',
  docType: 'Loại giấy tờ',
  docNumber: 'Số giấy tờ',
  fullName: 'Họ tên trên giấy tờ',
  frontPhoto: 'Ảnh mặt trước',
  selfiePhoto: 'Ảnh cầm giấy tờ',
  accuracyConfirmed: 'Cam kết thông tin chính xác',
  sellerTerms: 'Điều khoản người bán',
  identityConsent: 'Đồng ý xử lý dữ liệu định danh',
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
    if (!ok) toast.error('Vui lòng kiểm tra các trường được đánh dấu.')
    return ok
  }
  return { ...mutation, errors: { ...serverErrors, ...clientErrors } as Errors, check }
}

/** A number as typed in Vietnam ("1.500", "2,5"); undefined when empty, NaN when it is not a number. */
export const num = (s: string) => (s.trim() === '' ? undefined : Number(s.trim().replace(/\./g, '').replace(',', '.')))
export const str = (s: string) => (s.trim() === '' ? undefined : s.trim())

export type UploadKind = 'business-license' | 'identity-front' | 'identity-selfie'
