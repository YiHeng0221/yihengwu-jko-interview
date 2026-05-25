import { clsx } from 'clsx'
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'

export type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  label: ReactNode
  /** 是否為選中狀態（紅字＋紅 border＋白底 outlined）*/
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
        'inline-flex items-center justify-center rounded-button px-3 py-2 text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        active
          ? 'border border-brand bg-surface text-brand'
          : 'bg-surface-muted text-text-primary',
        disabled && 'cursor-not-allowed opacity-40',
        className,
      )}
      {...rest}
    >
      {label}
    </button>
  )
}
