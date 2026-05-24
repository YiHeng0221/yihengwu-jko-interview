import { useCallback } from 'react'
import { useSearchParams } from 'react-router'

export const CHARITY_TABS = ['ORG', 'CAMPAIGN', 'MERCHANDISE'] as const
export type CharityTab = (typeof CHARITY_TABS)[number]
export const DEFAULT_TAB: CharityTab = 'ORG'

function isCharityTab(value: string | null): value is CharityTab {
  return value !== null && (CHARITY_TABS as readonly string[]).includes(value)
}

/**
 * `?category=ORG|CAMPAIGN|MERCHANDISE` 跟 React state 雙向綁定的 hook。
 *
 * - 讀：URL 沒帶 / 帶不認得的值 → fallback 到 DEFAULT_TAB
 * - 寫：呼叫 `setTab(next)` 更新 URL，refresh 後保持
 * - 用 `replace: true` 避免 tab 切換污染 history
 *
 * 此 hook 必須在 `<BrowserRouter>` 內使用。
 */
export function useTabSync(): readonly [CharityTab, (next: CharityTab) => void] {
  const [params, setParams] = useSearchParams()
  const fromUrl = params.get('category')
  const current: CharityTab = isCharityTab(fromUrl) ? fromUrl : DEFAULT_TAB

  const setTab = useCallback(
    (next: CharityTab) => {
      setParams(
        (prev) => {
          const updated = new URLSearchParams(prev)
          updated.set('category', next)
          return updated
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return [current, setTab] as const
}
