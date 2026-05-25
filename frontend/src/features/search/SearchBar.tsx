import { useEffect, useRef } from 'react'
import { IconButton } from '../../lib/ui/IconButton/IconButton'
import { Input } from '../../lib/ui/Input/Input'

export type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onClose: () => void
}

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const CloseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export function SearchBar({ value, onChange, onClose }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div role="search" className="flex h-subrow items-center gap-2 border-b border-border bg-surface-muted px-3">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="請輸入關鍵字"
        aria-label="請輸入關鍵字"
        leadingIcon={<SearchIcon />}
        trailingSlot={
          value.length > 0 ? (
            <IconButton aria-label="清除搜尋" onClick={() => onChange('')}>
              <CloseIcon />
            </IconButton>
          ) : null
        }
        className="flex-1"
        inputSize="sm"
      />
      <button
        type="button"
        onClick={onClose}
        className="rounded px-2 py-1 text-sm font-medium text-[var(--color-link)] hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-link)] focus-visible:ring-offset-2"
      >
        取消
      </button>
    </div>
  )
}
