import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type components } from '@/shared/api'

export type CategoryCase = components['schemas']['DishCategoryCase']
export type CategoryNode = components['schemas']['CategoryNode']
export type ShopDish = components['schemas']['ShopDishCategory']
export type CaseStatus = 'RESTRICTED' | 'AUTO_CORRECTED' | 'APPEALED' | 'RESOLVED' | 'CONFIRMED' | 'EXPIRED' | 'APPEAL_ACCEPTED' | 'APPEAL_REJECTED'

export const CATEGORY_CASES_KEY = ['admin', 'category-cases'] as const

export function useCategoryCases(status: CaseStatus | '', vendorId: string, page: number, enabled: boolean) {
  return useQuery({
    queryKey: [...CATEGORY_CASES_KEY, 'list', status, vendorId, page],
    placeholderData: keepPreviousData,
    enabled,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/category-cases', {
        params: { query: { status: status || undefined, vendorId: vendorId || undefined, page, size: 20 } },
      })
      if (error || !data) throw error
      return data
    },
  })
}

export function useDecideAppeal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, decision, reason, categoryId }: { id: string; decision: 'ACCEPT' | 'REJECT'; reason: string; categoryId?: string }) => {
      const { data, error } = await api.POST('/api/admin/category-cases/{id}/decide', { params: { path: { id } }, body: { decision, reason, categoryId } })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORY_CASES_KEY }),
  })
}

/** A shop's current dishes with category path and rate: where an administrator finds the misfiled one. */
export function useShopDishes(vendorId: string) {
  return useQuery({
    queryKey: [...CATEGORY_CASES_KEY, 'shop-dishes', vendorId],
    enabled: vendorId !== '',
    queryFn: async () => {
      const { data, error } = await api.GET('/api/admin/merchants/{vendorId}/dishes', { params: { path: { vendorId } } })
      if (error || !data) throw error
      return data
    },
  })
}

export function useFlagDish() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ dishId, ...body }: { dishId: string; suggestedCategoryId: string; reason: string; deadlineAt?: string }) => {
      const { data, error } = await api.POST('/api/admin/dishes/{id}/flag', { params: { path: { id: dishId } }, body })
      if (error || !data) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORY_CASES_KEY }),
  })
}

export function useReclassifyDish() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ dishId, ...body }: { dishId: string; categoryId: string; reason: string }) => {
      const { error } = await api.POST('/api/admin/dishes/{id}/reclassify', { params: { path: { id: dishId } }, body })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CATEGORY_CASES_KEY }),
  })
}

/** The visible category tree (public): levels 1 to 3, the leaves are where a dish may sit. */
export function useCategoryTree() {
  return useQuery({
    queryKey: ['categories', 'tree'],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/categories')
      if (error || !data) throw error
      return data
    },
  })
}

/** Every level-3 category with the path to it (`Đồ uống › Cà phê`; the fixed root is left out). */
export function leaves(nodes: CategoryNode[], path: string[] = []): { id: string; label: string }[] {
  return nodes.flatMap((n) => {
    const next = n.level === 1 ? path : [...path, n.name ?? '']
    return n.children?.length ? leaves(n.children, next) : n.level === 3 ? [{ id: n.id ?? '', label: next.join(' › ') }] : []
  })
}
