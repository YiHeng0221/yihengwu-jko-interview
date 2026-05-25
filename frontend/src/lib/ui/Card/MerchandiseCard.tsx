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
      <div className="aspect-square w-full overflow-hidden bg-surface-muted">
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
      <div className="p-2">
        <div className="line-clamp-2 text-sm font-bold text-text-primary">{title}</div>
        {orgName && (
          <div className="mt-0.5 truncate text-xs text-text-primary">{orgName}</div>
        )}
        {priceNtd !== null && priceNtd !== undefined && (
          <div className="mt-1 text-sm font-bold text-brand">
            ${priceNtd.toLocaleString()}
          </div>
        )}
      </div>
    </article>
  )
}
