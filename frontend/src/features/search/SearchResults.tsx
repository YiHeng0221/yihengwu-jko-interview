import { EmptyState } from '../../lib/ui/EmptyState/EmptyState'
import { ErrorState } from '../../lib/ui/ErrorState/ErrorState'
import { CardSkeleton, CampaignCardSkeleton, MerchandiseCardSkeleton } from '../../lib/ui/Skeleton/Skeleton'
import { CharityItemCard } from '../charities/CharityItemCard'
import type { CharityTab } from '../charities/constants'
import { useSearch } from './useSearch'

export type SearchResultsProps = {
  query: string
  tab?: CharityTab
}

function ResultSkeletons({ tab }: { tab: CharityTab }) {
  if (tab === 'MERCHANDISE') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }, (_, i) => (
          <MerchandiseCardSkeleton key={i} />
        ))}
      </div>
    )
  }
  if (tab === 'CAMPAIGN') {
    return (
      <>
        {Array.from({ length: 4 }, (_, i) => (
          <CampaignCardSkeleton key={i} />
        ))}
      </>
    )
  }
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </>
  )
}

export function SearchResults({ query, tab = 'ORG' }: SearchResultsProps) {
  const { items, isLoading, isEmpty, error } = useSearch(query, tab)

  if (!query) return null

  const containerClass =
    tab === 'MERCHANDISE'
      ? 'grid grid-cols-2 gap-2 p-3'
      : 'flex flex-col gap-2 p-3'

  return (
    <div
      id="search-results-region"
      role="region"
      aria-label="搜尋結果"
      className={containerClass}
    >
      {isLoading && <ResultSkeletons tab={tab} />}
      {!isLoading && error && (
        <ErrorState title="搜尋發生錯誤" description="請稍後再試" retryLabel={null} />
      )}
      {!isLoading && !error && isEmpty && (
        <EmptyState title="找不到相關項目" description="請嘗試不同的關鍵字" />
      )}
      {!isLoading && !error &&
        items.map((item) => <CharityItemCard key={item.id} item={item} />)}
    </div>
  )
}
