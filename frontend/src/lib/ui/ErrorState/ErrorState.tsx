import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export type ErrorStateProps = {
  icon?: ReactNode
  title?: ReactNode
  description?: ReactNode
  /** Retry button label，預設「重試」。傳 null 隱藏 retry */
  retryLabel?: ReactNode | null
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  icon,
  title = '發生錯誤',
  description = '請稍後再試或聯絡支援',
  retryLabel = '重試',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={clsx(
        'flex flex-col items-center justify-center gap-3 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div aria-hidden="true" className="text-danger">
          {icon}
        </div>
      )}
      <div className="text-lg font-medium text-text-primary">{title}</div>
      {description && (
        <div className="text-sm text-text-secondary">{description}</div>
      )}
      {retryLabel !== null && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-button bg-brand px-4 py-2 text-text-on-brand transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          {retryLabel}
        </button>
      )}
    </div>
  )
}
