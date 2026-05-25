import { useEffect, useRef, useState } from 'react'
import { StickyHeaderStack } from '../../lib/layout/StickyHeaderStack/StickyHeaderStack'
import { SubRow } from '../../lib/layout/SubRow/SubRow'
import { TopBar } from '../../lib/layout/TopBar/TopBar'
import { Card } from '../../lib/ui/Card/Card'
import { Chip } from '../../lib/ui/Chip/Chip'
import { EndMarker } from '../../lib/ui/EndMarker/EndMarker'
import { ErrorState } from '../../lib/ui/ErrorState/ErrorState'
import { IconButton } from '../../lib/ui/IconButton/IconButton'
import { CardSkeleton } from '../../lib/ui/Skeleton/Skeleton'
import { Tabs } from '../../lib/ui/Tabs/Tabs'
import { CategoryDrawerDialog } from '../category/CategoryDrawerDialog'
import { useCategories } from '../category/useCategories'
import { SearchOverlay } from '../search/SearchOverlay'
import type { CharityItem } from './dto/charitiesListDTO'
import { useCharityList } from './useCharityList'
import { CHARITY_TABS } from './constants'
import type { CharityTab } from './constants'
import { useTabSync } from './useTabSync'

const TAB_LABELS: Record<CharityTab, string> = {
  ORG: '公益團體',
  CAMPAIGN: '捐款專案',
  MERCHANDISE: '義賣商品',
}

const TAB_ITEMS = CHARITY_TABS.map((tab) => ({
  value: tab,
  label: TAB_LABELS[tab],
}))

const SKELETON_KEYS = [
  'sk-0', 'sk-1', 'sk-2', 'sk-3', 'sk-4',
  'sk-5', 'sk-6', 'sk-7', 'sk-8', 'sk-9',
] as const

const SearchIcon = () => (
  <svg
    width="20"
    height="20"
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

function CharityCardItem({ item }: { item: CharityItem }) {
  return (
    <Card
      label={item.title}
      description={item.description}
      leading={
        item.logoUrl ? (
          <img
            src={item.logoUrl}
            alt=""
            aria-hidden="true"
            className="size-12 rounded-full object-cover"
          />
        ) : (
          <div aria-hidden="true" className="size-12 rounded-full bg-surface-muted" />
        )
      }
      className="mx-3 my-2"
    />
  )
}

export function CharityListPage() {
  const [tab, setTab] = useTabSync()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false)
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string | null>(null)

  const { data: categories = [] } = useCategories()

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isPending,
    isFetchingNextPage,
    refetch,
  } = useCharityList({ tab })

  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage) {
          void fetchNextPage()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, fetchNextPage])

  const allItems = data?.pages.flatMap((p) => p.items) ?? []
  const isInitialLoading = isPending
  const hasError = error !== null && allItems.length === 0
  const hasPaginationError = error !== null && allItems.length > 0
  const isDone = !hasNextPage && !hasPaginationError && data !== undefined && !isInitialLoading

  const selectedCategory = categories.find((c) => c.code === selectedCategoryCode)
  const categoryButtonLabel = selectedCategory ? `${selectedCategory.label} ▾` : '全部 ▾'

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <StickyHeaderStack>
        <TopBar title="所有捐款項目" />
        <Tabs
          items={TAB_ITEMS}
          value={tab}
          onChange={setTab}
          aria-label="捐款類別"
        />
        {!isSearchOpen && (
          <SubRow
            leading={
              <button
                type="button"
                className="text-sm text-text-primary"
                onClick={() => setIsCategoryDrawerOpen(true)}
              >
                {categoryButtonLabel}
              </button>
            }
            trailing={
              <IconButton aria-label="搜尋" onClick={() => setIsSearchOpen(true)}>
                <SearchIcon />
              </IconButton>
            }
          />
        )}
      </StickyHeaderStack>

      {isSearchOpen ? (
        <SearchOverlay onClose={() => setIsSearchOpen(false)} />
      ) : (
        <main className="flex-1">
          {hasError ? (
            <ErrorState onRetry={() => void refetch()} />
          ) : isInitialLoading ? (
            <div aria-busy="true" aria-label="載入中">
              {SKELETON_KEYS.map((key) => (
                <CardSkeleton key={key} className="mx-3 my-2" />
              ))}
            </div>
          ) : (
            <>
              <ul aria-label={`${TAB_LABELS[tab]}列表`}>
                {allItems.map((item) => (
                  <li key={item.id}>
                    <CharityCardItem item={item} />
                  </li>
                ))}
              </ul>
              {isFetchingNextPage && (
                <div aria-busy="true" aria-label="載入更多">
                  {SKELETON_KEYS.map((key) => (
                    <CardSkeleton key={key} className="mx-3 my-2" />
                  ))}
                </div>
              )}
              {hasPaginationError && <ErrorState onRetry={() => void fetchNextPage()} />}
              {isDone && <EndMarker />}
              <div ref={sentinelRef} aria-hidden="true" />
            </>
          )}
        </main>
      )}

      <CategoryDrawerDialog
        open={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
      >
        <div className="grid grid-cols-3 gap-2 p-4">
          <Chip
            label="全部"
            active={selectedCategoryCode === null}
            onClick={() => {
              setSelectedCategoryCode(null)
              setIsCategoryDrawerOpen(false)
            }}
          />
          {categories.map((cat) => (
            <Chip
              key={cat.code}
              label={cat.label}
              active={selectedCategoryCode === cat.code}
              onClick={() => {
                setSelectedCategoryCode(cat.code)
                setIsCategoryDrawerOpen(false)
              }}
            />
          ))}
        </div>
      </CategoryDrawerDialog>
    </div>
  )
}
