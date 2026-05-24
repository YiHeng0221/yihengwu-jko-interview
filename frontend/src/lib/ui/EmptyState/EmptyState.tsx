import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export type EmptyStateProps = {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Optional CTA — 例如「清除搜尋」button */
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      role="status"
      className={clsx(
        'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div aria-hidden="true" className="text-text-tertiary">
          {icon}
        </div>
      )}
      <div className="text-lg font-medium text-text-primary">{title}</div>
      {description && (
        <div className="text-sm text-text-secondary">{description}</div>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
