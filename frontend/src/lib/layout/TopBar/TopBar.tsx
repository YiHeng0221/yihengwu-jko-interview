import { clsx } from 'clsx'
import type { ReactNode } from 'react'

export type TopBarProps = {
  /** 標題（置中顯示）— 純文字，不接受 interactive ReactNode */
  title: string
  /** 左側 slot — 常見：返回 IconButton */
  leading?: ReactNode
  /** 右側 slot — 偶爾用（例如 actions）*/
  trailing?: ReactNode
  className?: string
}

/**
 * 44px 紅底 sticky header — 街口品牌色。
 * 標題用 absolute centering 避免 leading / trailing 寬度影響置中。
 */
export function TopBar({ title, leading, trailing, className }: TopBarProps) {
  return (
    <header
      className={clsx(
        'relative flex h-topbar w-full items-center justify-between bg-brand px-2 text-text-on-brand',
        className,
      )}
    >
      <div className="flex items-center">{leading}</div>
      <h1
        className="pointer-events-none absolute inset-0 flex items-center justify-center text-base font-medium"
      >
        {title}
      </h1>
      <div className="flex items-center">{trailing}</div>
    </header>
  )
}
