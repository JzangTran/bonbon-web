import { useQuery } from '@tanstack/react-query'
import { api, type components } from '@/shared/api'

export type Bank = components['schemas']['BankView']

/** The Napas banks VietQR knows; the backend accepts only these names for a payout or refund account. Rarely changes. */
export function useBanks() {
  return useQuery({
    queryKey: ['banks'],
    staleTime: 24 * 60 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/public/banks')
      if (error || !data) throw error
      return data
    },
  })
}

/** For matching what a person types against a bank: no accents, no spaces, lower case ("Vietcombank" = "vietcom bank"). */
export function fold(text: string) {
  return text.normalize('NFD').replace(/\p{M}/gu, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^A-Za-z0-9]/g, '').toLowerCase()
}

/** The bank a saved name refers to (short name, code or full name), as the backend matches it. */
export function findBank(banks: readonly Bank[] | undefined, saved: string): Bank | undefined {
  const key = fold(saved)
  if (!key || !banks) return undefined
  return banks.find((b) => [b.shortName, b.code, b.name].some((x) => x && fold(x) === key))
}
