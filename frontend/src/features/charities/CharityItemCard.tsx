import { Card } from '../../lib/ui/Card/Card'
import { CampaignCard } from '../../lib/ui/Card/CampaignCard'
import { MerchandiseCard } from '../../lib/ui/Card/MerchandiseCard'
import type { CharityTab } from './constants'

// 結構性型別：list DTO 跟 search DTO 都符合此 shape，避免綁特定 DTO source。
export type CharityCardItem = {
  id: string
  title: string
  description: string
  tab: CharityTab
  logoUrl?: string | null
  bannerImageUrl?: string | null
  orgName?: string | null
  tags?: string[]
  productImageUrl?: string | null
  priceNtd?: number | null
}

export type CharityItemCardProps = {
  item: CharityCardItem
  /** wrapper className 例如 \`mx-3 my-2\` 給 single-column list；MERCHANDISE 2-col grid 由外層 \`<ul>\` 控 */
  className?: string
}

/**
 * 依 item.tab 渲染對應 Card 變體。
 * ORG 用 generic Card（icon + title + description）
 * CAMPAIGN 用 CampaignCard（banner + orgName + title + tags）
 * MERCHANDISE 用 MerchandiseCard（product image + title + orgName + price）
 */
export function CharityItemCard({ item, className }: CharityItemCardProps) {
  if (item.tab === 'CAMPAIGN') {
    return (
      <CampaignCard
        title={item.title}
        orgName={item.orgName ?? null}
        bannerSrc={item.bannerImageUrl ?? null}
        tags={item.tags ?? []}
        {...(className !== undefined ? { className } : {})}
      />
    )
  }
  if (item.tab === 'MERCHANDISE') {
    return (
      <MerchandiseCard
        title={item.title}
        orgName={item.orgName ?? null}
        productImageSrc={item.productImageUrl ?? null}
        priceNtd={item.priceNtd ?? null}
        {...(className !== undefined ? { className } : {})}
      />
    )
  }
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
      {...(className !== undefined ? { className } : {})}
    />
  )
}
