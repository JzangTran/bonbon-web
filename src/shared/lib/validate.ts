import { t } from '@/shared/i18n'
/**
 * The same rules the backend applies to a form's fields (the request records), so a mistake is shown at the field before
 * anything is sent. The backend checks again; these only save a round trip and say it in the person's words.
 */

/** Vietnamese phone, mobile or landline: 0 or +84, then 9 or 10 digits. */
export const VN_PHONE = /^(0|\+84)\d{9,10}$/
/** Tax code: 10 digits, 10 digits with a 3-digit branch suffix, or the 12-digit personal number. */
export const TAX_CODE = /^(\d{10}(-\d{3})?|\d{12})$/
export const BANK_ACCOUNT = /^\d{6,19}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const isEmail = (value: string) => value.length <= 255 && EMAIL.test(value)

/** The phone as the person typed it, without the spaces and dots they use to read it. */
export const compactPhone = (value: string) => value.replace(/[\s.-]/g, '')

export type Errors = Record<string, string>

/** A required text of at most `max` characters; the message names the field. */
export function requiredText(errors: Errors, field: string, value: string, label: string, max: number, min = 1) {
  const v = value.trim()
  if (v === '') errors[field] = t('Hãy nhập {v0}.', { v0: label })
  else if (v.length < min) errors[field] = t('{v0}{v1} tối thiểu {v2} ký tự.', { v0: label[0].toUpperCase(), v1: label.slice(1), v2: min })
  else if (v.length > max) errors[field] = t('{v0}{v1} tối đa {v2} ký tự.', { v0: label[0].toUpperCase(), v1: label.slice(1), v2: max })
}
