import { clsx } from 'clsx'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react'

type CommonCardProps = {
  /** 是否可點 → 加 hover / focus / cursor 樣式 */
  interactive?: boolean
  /** 左側 leading slot — 常見：圓形 logo（48px）*/
  leading?: ReactNode
  /** 卡片標題；不限 string，可傳 ReactNode（icon + text 等） */
  label: ReactNode
  description?: ReactNode
  /** 右側 trailing slot — 例如 chevron */
  trailing?: ReactNode
}

/** HTMLAttributes 本身有 `title?: string`，會跟 CommonCardProps 的 ReactNode 取交集縮窄。
 *  因此用 CommonCardProps.label 命名，並 Omit 掉宿主 element 的 title 避免命名混淆。 */
type ArticleCardProps = CommonCardProps & Omit<HTMLAttributes<HTMLElement>, 'title'> & { as?: 'article' | 'div' }
type AnchorCardProps = CommonCardProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'title'> & { as: 'a' }
type ButtonCardProps = CommonCardProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> & { as: 'button' }

export type CardProps = ArticleCardProps | AnchorCardProps | ButtonCardProps

const CARD_CLASSES =
  'flex w-full items-start gap-3 rounded-card border border-border bg-surface p-3'
const INTERACTIVE_CLASSES =
  'cursor-pointer transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2'

function CardBody({
  leading,
  label,
  description,
  trailing,
}: Pick<CommonCardProps, 'leading' | 'label' | 'description' | 'trailing'>) {
  return (
    <>
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="min-w-0 flex-1">
        <div className="truncate text-base font-medium text-text-primary">{label}</div>
        {description && (
          <div className="mt-1 truncate text-sm text-text-secondary">{description}</div>
        )}
      </div>
      {trailing && <div className="shrink-0 self-center">{trailing}</div>}
    </>
  )
}

/** Exhaustive switch guard — 若未來 as 加新值會在這裡編譯失敗，符合 Hard Rule #16。 */
function assertNever(value: never): never {
  throw new Error(`unreachable: ${String(value)}`)
}

export function Card(props: CardProps) {
  const { interactive, leading, label, description, trailing, className: propClassName } = props
  const className = clsx(CARD_CLASSES, interactive && INTERACTIVE_CLASSES, propClassName)
  const body = <CardBody leading={leading} label={label} description={description} trailing={trailing} />

  // discriminated union on `as`，每個分支只解構自己變體的 props
  if (props.as === 'a') {
    const {
      interactive: _i, leading: _l, label: _lb, description: _d, trailing: _tr,
      className: _c, as: _a, ...rest
    } = props
    return (
      <a {...rest} className={className}>
        {body}
      </a>
    )
  }
  if (props.as === 'button') {
    const {
      interactive: _i, leading: _l, label: _lb, description: _d, trailing: _tr,
      className: _c, as: _a, type, ...rest
    } = props
    return (
      <button {...rest} type={type ?? 'button'} className={className}>
        {body}
      </button>
    )
  }
  if (props.as === 'div') {
    const {
      interactive: _i, leading: _l, label: _lb, description: _d, trailing: _tr,
      className: _c, as: _a, ...rest
    } = props
    return (
      <div {...rest} className={className}>
        {body}
      </div>
    )
  }
  // default: undefined or 'article'
  if (props.as === undefined || props.as === 'article') {
    const {
      interactive: _i, leading: _l, label: _lb, description: _d, trailing: _tr,
      className: _c, as: _a, ...rest
    } = props
    return (
      <article {...rest} className={className}>
        {body}
      </article>
    )
  }
  return assertNever(props.as)
}
