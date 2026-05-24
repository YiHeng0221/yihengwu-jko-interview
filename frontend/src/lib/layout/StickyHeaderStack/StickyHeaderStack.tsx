import { clsx } from 'clsx'
import type { ComponentPropsWithoutRef } from 'react'

export type StickyHeaderStackProps = ComponentPropsWithoutRef<'div'>

/**
 * 包子層、垂直疊；整塊 sticky top:0。
 *
 * 街口 spec 要求：上方三層（TopBar 44 + TabBar 48 + SubRow 48 = 140px）
 * 捲動時整塊黏住、僅列表內容滾動。
 *
 * 因此 wrapper 自己一個 sticky 容器即可，內部子層用 flex-col 自然疊。
 * 子層各自高度由 component / token 控（h-topbar、h-tabbar、h-subrow）。
 */
export function StickyHeaderStack({ children, className, ...rest }: StickyHeaderStackProps) {
  return (
    <div
      className={clsx('sticky top-0 z-20 flex w-full flex-col bg-surface', className)}
      {...rest}
    >
      {children}
    </div>
  )
}
