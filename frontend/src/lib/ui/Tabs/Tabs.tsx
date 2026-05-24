import { clsx } from 'clsx'
import type { KeyboardEvent, ReactNode } from 'react'

export type TabItem<TValue extends string> = {
  value: TValue
  label: ReactNode
  disabled?: boolean
}

export type TabsProps<TValue extends string> = {
  items: ReadonlyArray<TabItem<TValue>>
  value: TValue
  onChange: (next: TValue) => void
  'aria-label': string
  className?: string
}

/**
 * Sticky-friendly tab bar — active 標的 = 紅字 + 底線。
 * 配 `role="tablist"`，可用鍵盤 ←→ 切換。
 */
export function Tabs<TValue extends string>({
  items,
  value,
  onChange,
  className,
  ...rest
}: TabsProps<TValue>) {
  const activeIndex = items.findIndex((item) => item.value === value)

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const step = event.key === 'ArrowRight' ? 1 : -1
    let next = activeIndex
    for (let i = 0; i < items.length; i += 1) {
      next = (next + step + items.length) % items.length
      const candidate = items[next]
      if (candidate && !candidate.disabled) {
        onChange(candidate.value)
        return
      }
    }
  }

  return (
    <div
      role="tablist"
      aria-label={rest['aria-label']}
      onKeyDown={handleKeyDown}
      className={clsx(
        'flex h-tabbar w-full items-stretch border-b border-border bg-surface',
        className,
      )}
    >
      {items.map((item) => {
        const selected = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`tabpanel-${item.value}`}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={clsx(
              'relative flex-1 px-3 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:bg-surface-muted',
              selected ? 'text-brand' : 'text-text-secondary hover:text-text-primary',
              item.disabled && 'cursor-not-allowed opacity-40',
            )}
          >
            {item.label}
            {selected && (
              <span
                aria-hidden="true"
                className="absolute inset-x-3 bottom-0 h-[2px] bg-brand"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
