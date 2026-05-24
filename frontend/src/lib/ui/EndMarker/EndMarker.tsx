import { clsx } from 'clsx'

export type EndMarkerProps = {
  /** 顯示文字，預設「愛心沒有底線」（街口列表 spec）*/
  label?: string
  className?: string
}

export function EndMarker({ label = '愛心沒有底線', className }: EndMarkerProps) {
  // Spec mock `fe-feature-spec.md:49` 在文字旁畫了 ❤️，但「愛心沒有底線」這個
  // copy 本身已經有 "愛心" 兩字，再加 emoji 等於重複裝飾。確認後不渲染 emoji。
  return (
    <div
      role="separator"
      aria-label="列表結束"
      className={clsx(
        'flex items-center justify-center px-6 py-8 text-sm text-text-tertiary',
        className,
      )}
    >
      {label}
    </div>
  )
}
