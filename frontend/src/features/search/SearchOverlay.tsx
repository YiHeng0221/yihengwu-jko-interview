import { useEffect, useRef, useState } from 'react'
import { Button } from '../../lib/ui/Button/Button'
import { Card } from '../../lib/ui/Card/Card'
import { EmptyState } from '../../lib/ui/EmptyState/EmptyState'
import { ErrorState } from '../../lib/ui/ErrorState/ErrorState'
import { IconButton } from '../../lib/ui/IconButton/IconButton'
import { Input } from '../../lib/ui/Input/Input'
import { CardSkeleton } from '../../lib/ui/Skeleton/Skeleton'
import { useSearch } from './useSearch'

export type SearchOverlayProps = {
  /** 點「取消」或 Esc 時呼叫 */
  onClose: () => void
}

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

/**
 * 搜尋 overlay 容器：白底 search bar（介於 header 下 / tabs 上）+ 結果列表。
 * 父層在 search 模式時以此取代 SubRow + 列表內容。
 */
export function SearchOverlay({ onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const onCloseRef = useRef(onClose)
  const { items, isLoading, isEmpty, error } = useSearch(query)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div role="search">
      {/* Search bar — 同 SubRow 高度，置於 header 下 / tabs 上 */}
      <div className="flex h-subrow items-center gap-2 border-b border-border bg-surface px-3">
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜尋公益項目"
          aria-label="搜尋公益項目"
          leadingIcon={<SearchIcon />}
          trailingSlot={
            query.length > 0 ? (
              <IconButton aria-label="清除搜尋" onClick={() => setQuery('')}>
                <CloseIcon />
              </IconButton>
            ) : null
          }
          className="flex-1"
          inputSize="sm"
        />
        <Button variant="ghost" size="sm" onClick={onClose}>
          取消
        </Button>
      </div>

      {/* Results area */}
      <div role="region" aria-label="搜尋結果" className="flex flex-col gap-2 p-3">
        {isLoading && Array.from({ length: 5 }, (_, i) => <CardSkeleton key={i} />)}
        {!isLoading && error && (
          <ErrorState title="搜尋發生錯誤" description="請稍後再試" retryLabel={null} />
        )}
        {!isLoading && !error && isEmpty && (
          <EmptyState title="找不到相關項目" description="請嘗試不同的關鍵字" />
        )}
        {!isLoading && !error &&
          items.map((item) => (
            <Card key={item.id} label={item.title} description={item.description} />
          ))}
      </div>
    </div>
  )
}
