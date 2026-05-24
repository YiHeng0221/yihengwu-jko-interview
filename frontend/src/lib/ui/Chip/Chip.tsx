import type { ButtonHTMLAttributes } from 'react'

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  active?: boolean
}

const BASE =
  'inline-flex items-center px-4 py-2 text-sm font-medium rounded-[var(--radius-chip)] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
const ACTIVE = 'bg-brand text-[var(--color-text-on-brand)] border-brand'
const INACTIVE =
  'bg-[var(--color-surface)] text-[var(--color-text-primary)] border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]'

export function Chip({ label, active = false, className = '', ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={[BASE, active ? ACTIVE : INACTIVE, className].join(' ').trim()}
      {...props}
    >
      {label}
    </button>
  )
}
