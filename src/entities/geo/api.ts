import { useQuery } from '@tanstack/react-query'
import { api } from '@/shared/api'

export type Province = { code: number; name: string; type?: string }
export type Ward = { code: number; name: string; type?: string }
/** A point on the map turned into an address, matched to the lists of provinces and wards. */
export type Place = {
  placeId?: string
  formattedAddress?: string
  street?: string
  lat: number
  lng: number
  province?: string
  ward?: string
  provinceCode?: number
  wardCode?: number
}

/** The 34 provinces and cities. The list is a file in the backend and does not change while the app runs. */
export function useProvinces() {
  return useQuery({
    queryKey: ['geo', 'provinces'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/geo/provinces')
      if (error || !data) throw error
      return data as Province[]
    },
  })
}

export function useWards(provinceCode: number | undefined) {
  return useQuery({
    queryKey: ['geo', 'wards', provinceCode],
    enabled: provinceCode !== undefined,
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/geo/provinces/{code}/wards', { params: { path: { code: provinceCode! } } })
      if (error || !data) throw error
      return data as Ward[]
    },
  })
}

/** The address under a point of the map. */
export async function reverseGeocode(lat: number, lng: number): Promise<Place> {
  const { data, error } = await api.GET('/api/geo/reverse', { params: { query: { lat, lng } } })
  if (error || !data) throw error
  return data as Place
}

/** A suggestion as a point of the map. */
export async function placeOf(placeId: string): Promise<Place> {
  const { data, error } = await api.GET('/api/geo/place', { params: { query: { placeId } } })
  if (error || !data) throw error
  return data as Place
}

/** The first suggestion for a text (used to centre the map on a ward), as a point; null when there is none. */
export async function firstPlace(input: string): Promise<Place | null> {
  const { data, error } = await api.GET('/api/geo/autocomplete', { params: { query: { input } } })
  if (error || !data?.[0]?.placeId) return null
  return placeOf(data[0].placeId)
}

/** Suggestions for what the person types (three characters or more; the caller waits for a pause). */
export function useSuggestions(input: string) {
  return useQuery({
    queryKey: ['geo', 'autocomplete', input],
    enabled: input.length >= 3,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data, error } = await api.GET('/api/geo/autocomplete', { params: { query: { input } } })
      if (error || !data) throw error
      return data
    },
  })
}
