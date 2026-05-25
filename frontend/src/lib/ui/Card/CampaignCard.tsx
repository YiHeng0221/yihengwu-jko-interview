import { clsx } from 'clsx'
import { TagIcon } from '../icons/TagIcon'

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
      <div className="aspect-video w-full overflow-hidden rounded-t-card bg-surface-muted">
        {bannerSrc ? (
          <img src={bannerSrc} alt="" aria-hidden="true" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-surface-muted" aria-hidden="true" />
        )}
      </div>
      <div className="space-y-1.5 p-3">
        {orgName && (
          <div className="truncate text-xs leading-relaxed tracking-wide text-brand">{orgName}</div>
        )}
        <div className="line-clamp-2 text-base font-bold leading-relaxed tracking-wide text-text-primary">
          {title}
        </div>
        {tags && tags.length > 0 && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <TagIcon size={12} className="shrink-0 text-brand opacity-50" />
            <span className="truncate text-xs leading-relaxed tracking-wide text-text-tertiary">
              {tags.join('・')}
            </span>
          </div>
        )}
      </div>
    </article>
  )
}
