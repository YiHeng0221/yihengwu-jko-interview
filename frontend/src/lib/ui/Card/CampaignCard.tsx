import { clsx } from 'clsx'

export type CampaignCardProps = {
  bannerSrc?: string | null
  orgName?: string | null
  title: string
  tags?: string[]
  className?: string
}

const TagIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
    className="shrink-0"
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
)

export function CampaignCard({ bannerSrc, orgName, title, tags, className }: CampaignCardProps) {
  return (
    <article
      aria-label={title}
      className={clsx('overflow-hidden rounded-card border border-border bg-surface', className)}
    >
      <div className="aspect-video w-full overflow-hidden bg-surface-muted">
        {bannerSrc ? (
          <img src={bannerSrc} alt="" aria-hidden="true" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-surface-muted" aria-hidden="true" />
        )}
      </div>
      <div className="p-3">
        {orgName && (
          <div className="mb-1 truncate text-xs text-brand">{orgName}</div>
        )}
        <div className="line-clamp-2 text-base font-bold text-text-primary">{title}</div>
        {tags && tags.length > 0 && (
          <div className="mt-2 flex items-center gap-1">
            <TagIcon />
            <span className="text-xs text-text-tertiary">{tags.join('・')}</span>
          </div>
        )}
      </div>
    </article>
  )
}
