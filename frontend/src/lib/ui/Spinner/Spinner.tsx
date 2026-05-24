export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  'aria-label'?: string
}

const SIZE: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-8 border-[3px]',
}

export function Spinner({
  size = 'md',
  'aria-label': ariaLabel = 'Loading',
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-block animate-spin rounded-full border-[var(--color-border)] border-t-brand ${SIZE[size]}`}
    />
  )
}
