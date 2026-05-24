import { clsx } from 'clsx'
import type { KeyboardEvent, ReactNode } from 'react'
import { useRef } from 'react'

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
 * 配 `role="tablist"`，可用鍵盤 ←→/Home/End 切換。
 */
export function Tabs<TValue extends string>({
  items,
  value,
  onChange,
  className,
  'aria-label': ariaLabel,
}: TabsProps<TValue>) {
  const activeIndex = items.findIndex((item) => item.value === value)
  const tablistRef = useRef<HTMLDivElement>(null)

  if (import.meta.env.DEV && activeIndex === -1) {
    // eslint-disable-next-line no-console
    console.warn(`[Tabs] value "${value}" not found in items`)
  }

  function focusTab(index: number) {
    const buttons = tablistRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
    buttons?.[index]?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    let next = -1

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      const step = event.key === 'ArrowRight' ? 1 : -1
      let candidate = activeIndex
      for (let i = 0; i < items.length; i += 1) {
        candidate = (candidate + step + items.length) % items.length
        if (!items[candidate]?.disabled) {
          next = candidate
          break
        }
      }
    } else if (event.key === 'Home') {
      event.preventDefault()
      next = items.findIndex((item) => !item.disabled)
    } else if (event.key === 'End') {
      event.preventDefault()
      for (let i = items.length - 1; i >= 0; i -= 1) {
        if (!items[i]?.disabled) {
          next = i
          break
        }
      }
    } else {
      return
    }

    if (next !== -1) {
      onChange(items[next]!.value)
      focusTab(next)
    }
  }

  return (
    <div
      ref={tablistRef}
      role="tablist"
      aria-label={ariaLabel}
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
