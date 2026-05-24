import { useQuery } from '@tanstack/react-query'
import { env } from '../../lib/env'
import { apiFetch } from '../../lib/api-client'
import { parseCategoriesResponse } from './dto/categoriesDTO'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const raw = await apiFetch(`${env.VITE_API_BASE_URL}/categories`)
      return parseCategoriesResponse(raw)
    },
    staleTime: Infinity,
  })
}
