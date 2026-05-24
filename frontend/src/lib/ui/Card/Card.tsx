import { clsx } from 'clsx'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

type CommonCardProps = {
  /** 是否可點 → 加 hover / focus / cursor 樣式 */
  interactive?: boolean
  /** 左側 leading slot — 常見：圓形 logo（48px）*/
  leading?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** 右側 trailing slot — 例如 chevron */
  trailing?: ReactNode
}

type ArticleCardProps = CommonCardProps & HTMLAttributes<HTMLElement> & { as?: 'article' | 'div' }
type AnchorCardProps = CommonCardProps & AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a' }
type ButtonCardProps = CommonCardProps & ButtonHTMLAttributes<HTMLButtonElement> & { as: 'button' }

export type CardProps = ArticleCardProps | AnchorCardProps | ButtonCardProps

const CARD_CLASSES =
  'flex w-full items-start gap-3 rounded-card border border-border bg-surface p-3'
const INTERACTIVE_CLASSES =
  'cursor-pointer transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'

function CardBody({
  leading,
  title,
  description,
  trailing,
}: Pick<CommonCardProps, 'leading' | 'title' | 'description' | 'trailing'>) {
  return (
    <>
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-medium text-text-primary">{title}</div>
        {description && (
          <div className="mt-1 truncate text-sm text-text-secondary">{description}</div>
        )}
      </div>
      {trailing && <div className="shrink-0 self-center">{trailing}</div>}
    </>
  )
}

export function Card(props: CardProps) {
  const { interactive, leading, title, description, trailing } = props
  const className = clsx(
    CARD_CLASSES,
    interactive && INTERACTIVE_CLASSES,
    (props as { className?: string }).className,
  )
  const body = <CardBody leading={leading} title={title} description={description} trailing={trailing} />

  if (props.as === 'a') {
    const { interactive: _i, leading: _l, title: _t, description: _d, trailing: _tr, className: _c, as: _a, ...rest } = props
    return (
      <a {...rest} className={className}>
        {body}
      </a>
    )
  }
  if (props.as === 'button') {
    const { interactive: _i, leading: _l, title: _t, description: _d, trailing: _tr, className: _c, as: _a, type, ...rest } = props
    return (
      <button {...rest} type={type ?? 'button'} className={className}>
        {body}
      </button>
    )
  }
  const { interactive: _i, leading: _l, title: _t, description: _d, trailing: _tr, className: _c, as, ...rest } = props
  if (as === 'div') {
    return (
      <div {...rest} className={className}>
        {body}
      </div>
    )
  }
  return (
    <article {...rest} className={className}>
      {body}
    </article>
  )
}
