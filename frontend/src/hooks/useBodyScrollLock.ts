import { useEffect } from 'react'

/**
 * Drawer / Dialog 開啟時鎖 body scroll 並補 padding-right 抵銷 scrollbar 消失
 * 造成的 viewport width 變動（避免 fixed mask + 底層內容跳動 ~15px）。
 *
 * 標準做法（Radix / Material UI 同此模式）：
 *  1. lock：`overflow: hidden` + `paddingRight: <scrollbarWidth>px`
 *  2. unlock：還原前一個值
 */
export function useBodyScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight

    document.body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
    }
  }, [active])
}
