export type ShopAddressValue = { provinceCode?: number; wardCode?: number; detail: string; lat?: number; lng?: number }

/** What is wrong with the address, by field; `strict` also asks for every part (the step is being completed, not just saved). */
export function validateShopAddress(v: ShopAddressValue, strict: boolean): Record<string, string> {
  const errors: Record<string, string> = {}
  if (strict && v.provinceCode === undefined) errors.provinceCode = 'Hãy chọn Tỉnh/Thành phố.'
  else if (strict && v.wardCode === undefined) errors.wardCode = 'Hãy chọn Phường/Xã.'
  if (strict && v.detail.trim() === '') errors.addressDetail = 'Hãy nhập số nhà, tên đường.'
  if (v.detail.length > 200) errors.addressDetail = 'Địa chỉ chi tiết tối đa 200 ký tự.'
  if (strict && (v.lat === undefined || v.lng === undefined)) errors.location = 'Hãy bấm Định vị và chọn vị trí cửa hàng trên bản đồ.'
  return errors
}
