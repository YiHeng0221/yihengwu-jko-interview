import { useEffect, useRef } from 'react'
import { IconButton } from '../../lib/ui/IconButton/IconButton'
import { Input } from '../../lib/ui/Input/Input'
import { SearchIcon } from '../../lib/ui/icons/SearchIcon'
import { CloseIcon } from '../../lib/ui/icons/CloseIcon'

export type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onClose: () => void
}

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
    <div role="search" className="flex h-subrow items-center gap-2 border-b border-border bg-surface px-3">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="請輸入關鍵字"
        aria-label="請輸入關鍵字"
        aria-controls="search-results-region"
        leadingIcon={<SearchIcon />}
        trailingSlot={
          value.length > 0 ? (
            <IconButton aria-label="清除搜尋" onClick={() => onChange('')}>
              <CloseIcon />
            </IconButton>
          ) : null
        }
        className="flex-1 bg-surface-muted border-transparent"
        inputSize="sm"
      />
      <button
        type="button"
        onClick={onClose}
        className="rounded px-2 py-1 text-sm font-medium text-link hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-link focus-visible:ring-offset-2"
      >
        取消
      </button>
    </div>
  )
}
