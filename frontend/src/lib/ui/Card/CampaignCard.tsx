import { clsx } from 'clsx'

export type CampaignCardProps = {
  bannerSrc?: string | null
  orgName?: string | null
  title: string
  tags?: string[]
  className?: string
}

const TagIcon = ({ className }: { className?: string }) => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={clsx('shrink-0', className)}
  >
    <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
  </svg>
)

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
            <TagIcon className="text-brand opacity-50" />
            <span className="truncate text-xs leading-relaxed tracking-wide text-text-tertiary">
              {tags.join('・')}
            </span>
          </div>
        )}
      </div>
    </article>
  )
}
