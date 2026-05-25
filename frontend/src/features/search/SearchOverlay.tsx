import { useState } from 'react'
import { SearchBar } from './SearchBar'
import { SearchResults } from './SearchResults'

export type SearchOverlayProps = {
  /** 點「取消」或 Esc 時呼叫 */
  onClose: () => void
}

/**
 * 搜尋 overlay 包裝（測試用 / 獨立場景）：search bar + 結果列表。
 * CharityListPage 直接用 SearchBar + SearchResults 兩個 sub-component
 * 把 SearchBar 塞進 sticky header stack 內，與 spec 對齊。
 */
export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')

  return (
    <>
      <SearchBar value={query} onChange={setQuery} onClose={onClose} />
      <SearchResults query={query} />
    </>
  )
}
