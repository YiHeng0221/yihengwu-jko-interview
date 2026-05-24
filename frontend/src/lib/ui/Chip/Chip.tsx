import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'

export type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: ReactNode
  /** 是否為選中狀態（紅底白字）*/
  active?: boolean
  ref?: Ref<HTMLButtonElement>
}

export function Chip({ label, active = false, className, disabled, type = 'button', ref, ...rest }: ChipProps) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-pressed={active}
      className={clsx(
        'inline-flex items-center justify-center rounded-chip border px-3 py-1 text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        active
          ? 'border-brand bg-brand text-text-on-brand'
          : 'border-border bg-surface text-text-primary hover:border-brand hover:text-brand',
        disabled && 'cursor-not-allowed opacity-40 hover:border-border hover:text-text-primary',
        className,
      )}
      {...rest}
    >
      {label}
    </button>
  )
}
