import { clsx } from 'clsx'

export type MerchandiseCardProps = {
  productImageSrc?: string | null
  title: string
  orgName?: string | null
  priceNtd?: number | null
  className?: string
}

export function MerchandiseCard({
  productImageSrc,
  title,
  orgName,
  priceNtd,
  className,
}: MerchandiseCardProps) {
  return (
    <article
      aria-label={title}
      className={clsx('overflow-hidden rounded-card border border-border bg-surface', className)}
    >
      <div className="aspect-[4/3] w-full overflow-hidden rounded-t-card bg-surface-muted">
        {productImageSrc ? (
          <img
            src={productImageSrc}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-surface-muted" aria-hidden="true" />
        )}
      </div>
      <div className="space-y-1.5 p-3">
        <div className="line-clamp-2 text-sm leading-relaxed tracking-wide text-text-primary">
          {title}
        </div>
        {orgName && (
          <div className="truncate text-sm leading-relaxed tracking-wide text-text-secondary">
            {orgName}
          </div>
        )}
        {priceNtd !== null && priceNtd !== undefined && (
          <div className="text-sm font-bold leading-relaxed tracking-wide text-brand">
            NTD {priceNtd.toLocaleString()}
          </div>
        )}
      </div>
    </article>
  )
}
