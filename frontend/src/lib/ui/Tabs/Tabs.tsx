import { clsx } from 'clsx'
import type { KeyboardEvent, ReactNode } from 'react'
import { useLayoutEffect, useRef, useState } from 'react'

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

export function Tabs<TValue extends string>({
  items,
  value,
  onChange,
  className,
  'aria-label': ariaLabel,
}: TabsProps<TValue>) {
  const activeIndex = items.findIndex((item) => item.value === value)
  const tablistRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  if (import.meta.env.DEV && activeIndex === -1) {
    // eslint-disable-next-line no-console
    console.warn(`[Tabs] value "${value}" not found in items`)
  }

  useLayoutEffect(() => {
    const activeTab = tabRefs.current[activeIndex]
    const activeLabel = labelRefs.current[activeIndex]
    if (!activeTab || !activeLabel) return
    const labelWidth = activeLabel.offsetWidth
    setIndicator({
      left: activeTab.offsetLeft + (activeTab.offsetWidth - labelWidth) / 2,
      width: labelWidth,
    })
  }, [activeIndex])

  function focusTab(index: number) {
    tabRefs.current[index]?.focus()
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
        'relative flex h-tabbar w-full items-stretch border-b border-border bg-surface',
        className,
      )}
    >
      {items.map((item, idx) => {
        const selected = item.value === value
        return (
          <button
            key={item.value}
            ref={(el) => {
              tabRefs.current[idx] = el
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={clsx(
              'relative flex-1 px-3 transition-all duration-200 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset',
              selected
                ? 'text-lg font-bold text-text-primary'
                : 'text-base font-medium text-text-secondary hover:text-text-primary',
              item.disabled && 'cursor-not-allowed opacity-40',
            )}
          >
            <span
              ref={(el) => {
                labelRefs.current[idx] = el
              }}
            >
              {item.label}
            </span>
          </button>
        )
      })}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-[2px] rounded bg-brand"
        style={{
          width: indicator.width,
          transform: `translateX(${indicator.left}px)`,
          transition: 'transform 200ms ease-out, width 200ms ease-out',
        }}
      />
    </div>
  )
}
