import { useInfiniteQuery } from '@tanstack/react-query'
import { env } from '../../lib/env'
import { charitiesListResponseSchema } from './dto/charitiesListDTO'
import type { CharitiesListResponse } from './dto/charitiesListDTO'
import type { CharityTab } from './constants'

export type UseCharityListParams = {
  tab: CharityTab
  q?: string
}

type FetchParams = {
  tab: CharityTab
  q: string | undefined
  cursor: string | null
  signal: AbortSignal
}

async function fetchCharitiesPage(params: FetchParams): Promise<CharitiesListResponse> {
  const { tab, q, cursor, signal } = params
  const url = new URL(`${env.VITE_API_BASE_URL}/charities`)
  url.searchParams.set('category', tab)
  if (q) url.searchParams.set('q', q)
  if (cursor) url.searchParams.set('cursor', cursor)

  const res = await fetch(url.toString(), { signal })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return charitiesListResponseSchema.parse(await res.json())
}

export function useCharityList({ tab, q }: UseCharityListParams) {
  return useInfiniteQuery({
    queryKey: ['charities', tab, q ?? ''],
    queryFn: ({ pageParam, signal }) =>
      fetchCharitiesPage({ tab, q, cursor: pageParam, signal }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
