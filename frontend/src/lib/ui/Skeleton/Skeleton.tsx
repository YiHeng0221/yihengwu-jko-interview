import { clsx } from 'clsx'
import type { HTMLAttributes } from 'react'

export type SkeletonProps = HTMLAttributes<HTMLSpanElement> & {
  /** Shimmer 形狀 — line (默认 1em 高) / circle / block */
  shape?: 'line' | 'circle' | 'block'
}

export function Skeleton({ shape = 'line', className, ...rest }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'block animate-pulse bg-surface-muted',
        shape === 'line' && 'h-[1em] rounded',
        shape === 'circle' && 'size-12 rounded-full',
        shape === 'block' && 'h-16 rounded-card',
        className,
      )}
      {...rest}
    />
  )
}

/**
 * 列表用 placeholder（× 10 default）— 配合 CharityCard 結構：
 * 圓形 leading + 兩行 text。
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'flex w-full items-start gap-3 rounded-card border border-border bg-surface p-3',
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton shape="circle" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="w-1/2" />
        <Skeleton className="w-3/4" />
      </div>
    </div>
  )
}
