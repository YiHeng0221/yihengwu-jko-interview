import { Card } from '../../lib/ui/Card/Card'
import { EmptyState } from '../../lib/ui/EmptyState/EmptyState'
import { ErrorState } from '../../lib/ui/ErrorState/ErrorState'
import { CardSkeleton } from '../../lib/ui/Skeleton/Skeleton'
import { useSearch } from './useSearch'

export type SearchResultsProps = {
  query: string
}

export function SearchResults({ query }: SearchResultsProps) {
  const { items, isLoading, isEmpty, error } = useSearch(query)

  if (!query) return null

  return (
    <div id="search-results-region" role="region" aria-label="搜尋結果" className="flex flex-col gap-2 p-3">
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
  )
}
