import type { IconProps } from './SearchIcon'

export function ChevronDownIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" className={className}>
      <polyline points="5 9 12 16 19 9" />
    </svg>
  )
}
