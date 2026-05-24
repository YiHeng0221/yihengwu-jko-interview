import { clsx } from 'clsx'
import type { ReactNode } from 'react'
import emptyNoData from '@/assets/empty-no-data.png'

export type EmptyStateProps = {
  icon?: ReactNode
  title?: ReactNode
  description?: ReactNode
  /** Optional CTA — 例如「清除搜尋」button */
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title = '查無相關資料',
  description = '請調整關鍵字再重新搜尋',
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      role="status"
      className={clsx(
        'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
        className,
      )}
    >
      {icon ? (
        <div aria-hidden="true" className="text-text-tertiary">
          {icon}
        </div>
      ) : (
        <img src={emptyNoData} alt="" width={144} height={144} data-testid="empty-no-data-img" />
      )}
      <div className="text-lg font-medium text-text-primary">{title}</div>
      {description != null && (
        <div className="text-sm text-text-secondary">{description}</div>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
