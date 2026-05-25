import { useEffect, useRef, useState } from 'react'
import { StickyHeaderStack } from '../../lib/layout/StickyHeaderStack/StickyHeaderStack'
import { SubRow } from '../../lib/layout/SubRow/SubRow'
import { TopBar } from '../../lib/layout/TopBar/TopBar'
import { Card } from '../../lib/ui/Card/Card'
import { CampaignCard } from '../../lib/ui/Card/CampaignCard'
import { MerchandiseCard } from '../../lib/ui/Card/MerchandiseCard'
import { Chip } from '../../lib/ui/Chip/Chip'
import { EndMarker } from '../../lib/ui/EndMarker/EndMarker'
import { ErrorState } from '../../lib/ui/ErrorState/ErrorState'
import { IconButton } from '../../lib/ui/IconButton/IconButton'
import {
  CardSkeleton,
  CampaignCardSkeleton,
  MerchandiseCardSkeleton,
} from '../../lib/ui/Skeleton/Skeleton'
import { Tabs } from '../../lib/ui/Tabs/Tabs'
import { CategoryDrawerDialog } from '../category/CategoryDrawerDialog'
import { useCategories } from '../category/useCategories'
import { SearchBar } from '../search/SearchBar'
import { SearchResults } from '../search/SearchResults'
import type { CharityItem } from './dto/charitiesListDTO'
import { useCharityList } from './useCharityList'
import { SearchIcon } from '../../lib/ui/icons/SearchIcon'
import { ChevronDownIcon } from '../../lib/ui/icons/ChevronDownIcon'
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


function OrgCardItem({ item }: { item: CharityItem }) {
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
            className="size-12 rounded object-cover"
          />
        ) : (
          <div aria-hidden="true" className="size-12 rounded bg-surface-muted" />
        )
      }
      className="mx-3 my-2"
    />
  )
}

function CampaignCardItem({ item }: { item: CharityItem }) {
  return (
    <CampaignCard
      title={item.title}
      orgName={item.orgName}
      bannerSrc={item.bannerImageUrl}
      tags={item.tags}
      className="mx-auto my-2 max-w-md"
    />
  )
}

function MerchandiseCardItem({ item }: { item: CharityItem }) {
  return (
    <MerchandiseCard
      title={item.title}
      orgName={item.orgName}
      productImageSrc={item.productImageUrl}
      priceNtd={item.priceNtd}
    />
  )
}

function LoadingSkeletons({ tab }: { tab: CharityTab }) {
  if (tab === 'MERCHANDISE') {
    return (
      <div className="mx-auto grid max-w-md grid-cols-2 gap-2 px-3 py-2">
        {SKELETON_KEYS.map((key) => (
          <MerchandiseCardSkeleton key={key} />
        ))}
      </div>
    )
  }
  if (tab === 'CAMPAIGN') {
    return (
      <>
        {SKELETON_KEYS.map((key) => (
          <CampaignCardSkeleton key={key} className="mx-auto my-2 max-w-md" />
        ))}
      </>
    )
  }
  return (
    <>
      {SKELETON_KEYS.map((key) => (
        <CardSkeleton key={key} className="mx-3 my-2" />
      ))}
    </>
  )
}

function ItemList({ items, tab }: { items: CharityItem[]; tab: CharityTab }) {
  if (tab === 'MERCHANDISE') {
    return (
      <ul
        aria-label={`${TAB_LABELS[tab]}列表`}
        className="mx-auto grid max-w-md grid-cols-2 gap-2 px-3 py-2"
      >
        {items.map((item) => (
          <li key={item.id}>
            <MerchandiseCardItem item={item} />
          </li>
        ))}
      </ul>
    )
  }
  if (tab === 'CAMPAIGN') {
    return (
      <ul aria-label={`${TAB_LABELS[tab]}列表`}>
        {items.map((item) => (
          <li key={item.id}>
            <CampaignCardItem item={item} />
          </li>
        ))}
      </ul>
    )
  }
  return (
    <ul aria-label={`${TAB_LABELS[tab]}列表`}>
      {items.map((item) => (
        <li key={item.id}>
          <OrgCardItem item={item} />
        </li>
      ))}
    </ul>
  )
}

export function CharityListPage() {
  const [tab, setTab] = useTabSync()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
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
  } = useCharityList({ tab, categoryCode: selectedCategoryCode })

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
  const categoryButtonLabel = selectedCategory ? selectedCategory.label : '全部'

  function handleCloseSearch() {
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <StickyHeaderStack>
        <TopBar title="所有捐款項目" />
        {isSearchOpen && (
          <SearchBar value={searchQuery} onChange={setSearchQuery} onClose={handleCloseSearch} />
        )}
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
                className="inline-flex items-center gap-1.5 rounded-button bg-surface-muted px-3 py-1 text-sm text-text-secondary hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                onClick={() => setIsCategoryDrawerOpen(true)}
              >
                <span>{categoryButtonLabel}</span>
                <ChevronDownIcon />
              </button>
            }
            trailing={
              <IconButton
                aria-label="搜尋"
                onClick={() => setIsSearchOpen(true)}
                className="text-text-secondary"
              >
                <SearchIcon size={20} />
              </IconButton>
            }
          />
        )}
      </StickyHeaderStack>

      {isSearchOpen ? (
        <SearchResults query={searchQuery} tab={tab} />
      ) : (
        <main className="flex-1">
          {hasError ? (
            <ErrorState onRetry={() => void refetch()} />
          ) : isInitialLoading ? (
            <div aria-busy="true" aria-label="載入中">
              <LoadingSkeletons tab={tab} />
            </div>
          ) : (
            <>
              <ItemList items={allItems} tab={tab} />
              {isFetchingNextPage && (
                <div aria-busy="true" aria-label="載入更多">
                  <LoadingSkeletons tab={tab} />
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
        <div className="grid grid-cols-3 gap-3 p-4">
          {categories.map((cat) => (
            <Chip
              key={cat.code}
              label={cat.label}
              active={cat.code === 'ALL' ? selectedCategoryCode === null : selectedCategoryCode === cat.code}
              onClick={() => {
                setSelectedCategoryCode(cat.code === 'ALL' ? null : cat.code)
              }}
            />
          ))}
        </div>
      </CategoryDrawerDialog>
    </div>
  )
}
