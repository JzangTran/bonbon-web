import { parsePhoneNumberFromString } from 'libphonenumber-js/max'
import { t } from '@/shared/i18n'
/**
 * The same rules the backend applies to a form's fields (the request records and common/validation), so a mistake is shown at the
 * field before anything is sent. The backend checks again; these only save a round trip and say it in the person's words.
 */

/** Tax code: 10 digits, 10 digits with a 3-digit branch suffix, or the 12-digit personal number (the CCCD number). */
export const TAX_CODE = /^(\d{10}(-\d{3})?|\d{12})$/
export const BANK_ACCOUNT = /^\d{6,19}$/
const EMAIL = /^(?!\.)(?!.*\.\.)[A-Za-z0-9._%+-]{1,64}(?<!\.)@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/
const PHONE_SHAPE = /^(0|\+84)\d{8,10}$/
const NAME = /^[\p{L}\p{M}]+(?:[ .'-]{1,2}[\p{L}\p{M}]+)*\.?$/u

/** An address mail can be sent to: a dot and a top-level domain after the @, no spaces or double dots (backend RealEmail). */
export const isEmail = (value: string) => value.trim().length <= 254 && EMAIL.test(value.trim())

/** The phone as the person typed it, without the spaces, dots and dashes they use to read it. */
export const compactPhone = (value: string) => value.replace(/[\s.()-]/g, '')

/**
 * A Vietnamese number that exists, by Google's numbering data (backend VnPhone): `mobile` for people, `any` also allows a shop's
 * landline with its area code (028…, 024…).
 */
export function isVnPhone(value: string, kind: 'mobile' | 'any' = 'mobile') {
  const v = compactPhone(value)
  if (!PHONE_SHAPE.test(v)) return false
  const phone = parsePhoneNumberFromString(v, 'VN')
  if (!phone || phone.countryCallingCode !== '84' || !phone.isValid()) return false
  const type = phone.getType()
  return kind === 'mobile' ? type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE' : type === 'MOBILE' || type === 'FIXED_LINE' || type === 'FIXED_LINE_OR_MOBILE'
}

/** A person's name as on papers: letters of any language with single spaces, dots, apostrophes or hyphens between (backend PersonName). */
export function isPersonName(value: string) {
  const v = value.trim()
  if (v === '') return true
  const letters = [...v].filter((c) => /\p{L}/u.test(c)).length
  return letters >= 2 && NAME.test(v)
}

const COMMON_PASSWORDS = new Set([
  '12345678', '123456789', '1234567890', '123123123', '11111111', '00000000', '88888888', '66666666', '99999999', '87654321',
  '12341234', '11223344', '123456789a', '1234567a', 'password', 'password1', 'password123', 'passw0rd', 'iloveyou', 'qwertyui',
  'qwerty123', 'qwertyuiop', '1qaz2wsx', 'abc12345', 'abcd1234', 'a1234567', 'aa123456', 'asdfghjk', 'zxcvbnm1', 'admin123',
  'welcome1', 'letmein1', 'sunshine', 'princess', 'football', 'baseball', 'matkhau', 'matkhau1', 'matkhau123', 'anhyeuem',
  'emyeuanh', 'yeuemmaimai', 'vietnam1', 'vietnam123', 'hanoi123', 'saigon123', 'bonbon123', 'bonbon2026', 'bonbon2027',
])

/** Why a new password would be refused (backend PasswordPolicy), or null. Same wording as the server. */
export function passwordProblem(password: string, email?: string, name?: string): string | null {
  if (password.length < 8) return t('Mật khẩu cần ít nhất 8 ký tự.')
  if (password.length > 100) return t('Mật khẩu tối đa 100 ký tự.')
  const lower = password.toLowerCase()
  if (COMMON_PASSWORDS.has(lower)) return t('Mật khẩu này quá phổ biến và dễ bị đoán. Hãy chọn mật khẩu khác.')
  if (new Set(password).size <= 2) return t('Mật khẩu không được chỉ lặp lại một vài ký tự.')
  if (isRun(lower)) return t('Mật khẩu không được là dãy ký tự liên tiếp như 12345678 hay abcdefgh.')
  const local = (email ?? '').trim().toLowerCase().split('@')[0]
  if (local.length >= 4 && lower.includes(local)) return t('Mật khẩu không được chứa email của bạn.')
  const compactName = (name ?? '').toLowerCase().replace(/\s+/g, '')
  if (compactName.length >= 4 && lower.replace(/\s+/g, '').includes(compactName)) return t('Mật khẩu không được chứa họ tên của bạn.')
  return null
}

function isRun(s: string) {
  const step = s.charCodeAt(1) - s.charCodeAt(0)
  if (Math.abs(step) !== 1) return false
  for (let i = 2; i < s.length; i++) if (s.charCodeAt(i) - s.charCodeAt(i - 1) !== step) return false
  return true
}

/** 0 to 4 for the strength bar: length and variety, after the hard rules above pass. */
export function passwordStrength(password: string, email?: string, name?: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0
  if (passwordProblem(password, email, name)) return 1
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(password)).length
  const score = (password.length >= 12 ? 2 : 1) + (kinds >= 3 ? 1 : 0) + (password.length >= 16 ? 1 : 0)
  return Math.min(4, score + 1) as 2 | 3 | 4
}

/** CCCD province codes (the 63 provinces before the 2025 merger; issued numbers kept their codes). */
const PROVINCES = new Set(
  '001 002 004 006 008 010 011 012 014 015 017 019 020 022 024 025 026 027 030 031 033 034 035 036 037 038 040 042 044 045 046 048 049 051 052 054 056 058 060 062 064 066 067 068 070 072 074 075 077 079 080 082 083 084 086 087 089 091 092 093 094 095 096'.split(' '),
)

/** Why an identity number cannot be right for its document type (backend VnIdNumber), or null. */
export function idNumberProblem(docType: 'CCCD' | 'CMND', number: string): string | null {
  if (docType === 'CMND') {
    if (/^\d{9}$/.test(number)) return null
    // the 12-digit CMND (2012–2016) is built like a CCCD number
    if (!/^\d{12}$/.test(number)) return t('Số CMND gồm 9 hoặc 12 chữ số.')
  } else if (!/^\d{12}$/.test(number)) return t('Số CCCD gồm 12 chữ số.')
  if (!PROVINCES.has(number.slice(0, 3))) return t('Ba số đầu của CCCD là mã tỉnh nơi đăng ký khai sinh; mã {v0} không tồn tại.', { v0: number.slice(0, 3) })
  const sexCentury = Number(number[3])
  if (sexCentury > 3) return t('Số thứ tư của CCCD (giới tính và thế kỷ sinh) phải từ 0 đến 3.')
  const year = (sexCentury < 2 ? 1900 : 2000) + Number(number.slice(4, 6))
  if (year > new Date().getFullYear()) return t('Năm sinh trong số CCCD nằm ở tương lai; hãy kiểm tra lại.')
  return null
}

export type Errors = Record<string, string>

/** A required text of at most `max` characters; the message names the field. */
export function requiredText(errors: Errors, field: string, value: string, label: string, max: number, min = 1) {
  const v = value.trim()
  if (v === '') errors[field] = t('Hãy nhập {v0}.', { v0: label })
  else if (v.length < min) errors[field] = t('{v0}{v1} tối thiểu {v2} ký tự.', { v0: label[0].toUpperCase(), v1: label.slice(1), v2: min })
  else if (v.length > max) errors[field] = t('{v0}{v1} tối đa {v2} ký tự.', { v0: label[0].toUpperCase(), v1: label.slice(1), v2: max })
}
