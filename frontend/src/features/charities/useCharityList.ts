import { useInfiniteQuery } from '@tanstack/react-query'
import { env } from '../../lib/env'
import { charitiesListResponseSchema } from './dto/charitiesListDTO'
import type { CharitiesListResponse } from './dto/charitiesListDTO'
import type { CharityTab } from './constants'

export type UseCharityListParams = {
  tab: CharityTab
  q?: string
  categoryCode?: string | null
}

type PageParam = string | null

type FetchParams = {
  tab: CharityTab
  q: string | undefined
  categoryCode: string | null | undefined
  cursor: PageParam
  signal: AbortSignal
}

async function fetchCharitiesPage(params: FetchParams): Promise<CharitiesListResponse> {
  const { tab, q, categoryCode, cursor, signal } = params
  const url = new URL(`${env.VITE_API_BASE_URL}/charities`)
  url.searchParams.set('category', tab)
  if (q) url.searchParams.set('q', q)
  if (categoryCode) url.searchParams.set('category_code', categoryCode)
  if (cursor) url.searchParams.set('cursor', cursor)

  const res = await fetch(url.toString(), { signal })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  return charitiesListResponseSchema.parse(await res.json())
}

export function useCharityList({ tab, q, categoryCode }: UseCharityListParams) {
  // 顯式 generic：TQueryFnData=CharitiesListResponse / TError=Error /
  // TData=InfiniteData / TQueryKey=string array / TPageParam=string|null
  // 沒指定的話 pageParam 預設 unknown，會讓 fetchCharitiesPage 的 cursor 型別爆。
  return useInfiniteQuery<
    CharitiesListResponse,
    Error,
    { pages: CharitiesListResponse[]; pageParams: PageParam[] },
    readonly [string, CharityTab, string, string],
    PageParam
  >({
    queryKey: ['charities', tab, q ?? '', categoryCode ?? ''] as const,
    queryFn: ({ pageParam, signal }) =>
      fetchCharitiesPage({ tab, q, categoryCode, cursor: pageParam, signal }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
