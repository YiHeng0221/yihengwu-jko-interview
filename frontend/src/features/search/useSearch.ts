import { useEffect, useRef, useState } from 'react'
import { env } from '../../lib/env'
import { searchListResponseSchema, type SearchCharityItem } from './dto/searchListDTO'
import type { CharityTab } from '../charities/constants'

export type SearchState = {
  items: SearchCharityItem[]
  isLoading: boolean
  isEmpty: boolean
  error: Error | null
}

const INITIAL_STATE: SearchState = {
  items: [],
  isLoading: false,
  isEmpty: false,
  error: null,
}

/**
 * 300ms debounce on query changes; tab changes fire immediately (delay=0).
 * AbortController 競態管理。query 為空時立即重置，不發 request。
 */
export function useSearch(rawQuery: string, tab: CharityTab): SearchState {
  const [state, setState] = useState<SearchState>(INITIAL_STATE)
  const prevTabRef = useRef<CharityTab>(tab)

  useEffect(() => {
    const trimmed = rawQuery.trim()

    if (trimmed === '') {
      prevTabRef.current = tab
      setState(INITIAL_STATE)
      return
    }

    const tabChanged = prevTabRef.current !== tab
    prevTabRef.current = tab
    const delay = tabChanged ? 0 : 300

    let cancelled = false
    const controller = new AbortController()

    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      const url = `${env.VITE_API_BASE_URL}/charities?q=${encodeURIComponent(trimmed)}&category=${tab}`

      void (async () => {
        try {
          const res = await fetch(url, { signal: controller.signal })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const json: unknown = await res.json()
          if (cancelled) return
          const parsed = searchListResponseSchema.parse(json)
          setState({
            items: parsed.items,
            isLoading: false,
            isEmpty: parsed.items.length === 0,
            error: null,
          })
        } catch (error) {
          if (cancelled || (error instanceof Error && error.name === 'AbortError')) return
          setState({
            items: [],
            isLoading: false,
            isEmpty: false,
            error: error instanceof Error ? error : new Error(String(error)),
          })
        }
      })()
    }, delay)

    return () => {
      cancelled = true
      clearTimeout(timer)
      controller.abort()
    }
  }, [rawQuery, tab])

  return state
}
