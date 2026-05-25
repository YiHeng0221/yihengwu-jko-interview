import { clsx } from 'clsx'
import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useBodyScrollLock } from '../../../hooks/useBodyScrollLock'
import { CloseIcon } from '../icons/CloseIcon'

export type DrawerProps = {
  open: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  closeLabel?: string
  className?: string
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Drawer({ open, onClose, title, children, closeLabel = '關閉', className }: DrawerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const previousActiveRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const titleId = useId()

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return

    previousActiveRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null

    const container = containerRef.current
    const firstFocusable = container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)
    firstFocusable?.focus()

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCloseRef.current()
        return
      }
      if (event.key === 'Tab' && container) {
        const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        if (focusables.length === 0) return
        const first = focusables[0]!
        const last = focusables[focusables.length - 1]!
        const active = document.activeElement
        if (event.shiftKey && active === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && active === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('keydown', handleKey)
      previousActiveRef.current?.focus()
    }
  }, [open])

  if (!open) return null

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onCloseRef.current()
    }
  }

  return createPortal(
    <div
      onMouseDown={handleOverlayClick}
      className={clsx(
        'fixed inset-0 z-50 flex items-end justify-center bg-surface-overlay',
      )}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={clsx(
          'animate-slide-up relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-card bg-surface shadow-md',
          className,
        )}
      >
        <header className="relative flex items-center justify-center border-b border-border px-4 py-3">
          <h2 id={titleId} className="text-lg font-medium text-text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute right-4 rounded-button p-1 text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <CloseIcon size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-auto px-4 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
