import { clsx } from 'clsx'

export type CampaignCardProps = {
  bannerSrc?: string | null
  orgName?: string | null
  title: string
  tags?: string[]
  className?: string
}

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
          <div className="mb-1 truncate text-sm text-text-secondary">{orgName}</div>
        )}
        <div className="line-clamp-2 text-base font-bold text-text-primary">{title}</div>
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-chip bg-surface-muted px-3 py-1 text-xs text-brand"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
