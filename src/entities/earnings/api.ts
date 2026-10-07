import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api, type components } from '@/shared/api'

export type EarningsSummary = components['schemas']['EarningsSummary']
export type EarningsEntry = components['schemas']['EarningsEntry']
export type EarningsStatement = components['schemas']['SettlementStatement']
export type EarningsPeriod = components['schemas']['SettlementPeriod']

export const EARNINGS_KEY = ['merchant', 'earnings'] as const

export function useEarnings() {
  return useQuery({
    queryKey: [...EARNINGS_KEY, 'summary'],
    refetchInterval: 60_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/merchant/earnings')
      if (error || !data) throw error
      return data
    },
  })
}

export type Granularity = 'day' | 'week' | 'month'

export function useEarningsStatement(granularity: Granularity) {
  return useQuery({
    queryKey: [...EARNINGS_KEY, 'statement', granularity],
    queryFn: async () => {
      const { data, error } = await api.GET('/api/merchant/earnings/statements', { params: { query: { granularity } } })
      if (error || !data) throw error
      return data
    },
  })
}

/** The ledger, newest first; the start and end of a period narrow it to the orders behind one statement row. */
export function useEarningsLedger(filter: { type: string | null; from?: string; to?: string; page: number }) {
  return useQuery({
    queryKey: [...EARNINGS_KEY, 'ledger', filter],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/merchant/earnings/ledger', {
        params: {
          query: {
            page: filter.page,
            size: 20,
            ...(filter.type ? { type: filter.type } : {}),
            ...(filter.from ? { from: filter.from } : {}),
            ...(filter.to ? { to: filter.to } : {}),
          },
        },
      })
      if (error || !data) throw error
      return data
    },
  })
}
