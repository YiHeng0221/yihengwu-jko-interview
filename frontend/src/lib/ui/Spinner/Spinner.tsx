import type { HTMLAttributes } from 'react'
import { cn } from '../../cn/cn'

type SpinnerSize = 'sm' | 'md' | 'lg'

export type SpinnerProps = Omit<HTMLAttributes<HTMLSpanElement>, 'role' | 'aria-live'> & {
  size?: SpinnerSize
  /** Visible-to-AT label; defaults to "載入中". 設 `''` 來讓父層自帶 aria-label */
  label?: string
}

const SIZE_CLASSES: Record<SpinnerSize, string> = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-10 border-[3px]',
}

export function Spinner({ size = 'md', label = '載入中', className, ...rest }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label || undefined}
      className={cn('inline-block', className)}
      {...rest}
    >
      <span
        aria-hidden="true"
        className={cn(
          'block animate-spin rounded-full border-current border-t-transparent text-brand',
          SIZE_CLASSES[size],
        )}
      />
    </span>
  )
}
