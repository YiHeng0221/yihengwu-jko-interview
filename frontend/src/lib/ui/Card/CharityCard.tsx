import { clsx } from 'clsx'

export type CharityCardProps = {
  logoSrc: string
  name: string
  description?: string
  className?: string
}

export function CharityCard({ logoSrc, name, description, className }: CharityCardProps) {
  return (
    <article
      className={clsx(
        'flex w-full items-start gap-3 rounded-[12px] border border-border bg-surface p-[9px] pr-3',
        className,
      )}
    >
      <div className="shrink-0">
        <img
          src={logoSrc}
          alt=""
          width={48}
          height={48}
          className="size-12 rounded-[8px] border border-[#EDEDF1] object-cover"
          data-testid="charity-logo"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-base leading-6 text-text-primary">{name}</div>
        {description && (
          <div className="truncate text-[13px] leading-5 text-text-secondary">{description}</div>
        )}
      </div>
    </article>
  )
}
