import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

export interface DialogProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
}

export function Dialog({ open, onClose, children, title }: DialogProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    containerRef.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-[var(--color-surface-overlay)]" aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? '選單'}
        tabIndex={-1}
        ref={containerRef}
        className="relative z-10 bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-md)] max-w-lg w-full mx-4 p-6 focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          {title != null && (
            <h2 className="text-lg font-medium text-[var(--color-text-primary)]">{title}</h2>
          )}
          <button
            type="button"
            aria-label="關閉"
            onClick={onClose}
            className="ml-auto p-2 hover:bg-[var(--color-surface-muted)] rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
