import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export type SubRowProps = {
  /** 左側 slot — 常見：類別選單 button + caret */
  leading?: ReactNode
  /** 右側 slot — 常見：搜尋 IconButton */
  trailing?: ReactNode
  className?: string
}

/**
 * 子列 — flex justify-between，48px 高，sticky friendly。
 * 左：「全部 ▾」類別 button；右：🔍 搜尋 icon。
 * 搜尋模式啟動時 SubRow 由 SearchBar 取代（caller 自行決定 render 哪個）。
 */
export function SubRow({ leading, trailing, className }: SubRowProps) {
  return (
    <div
      className={clsx(
        'flex h-subrow w-full items-center justify-between border-b border-border bg-surface px-3',
        className,
      )}
    >
      <div className="flex items-center">{leading}</div>
      <div className="flex items-center">{trailing}</div>
    </div>
  )
}
