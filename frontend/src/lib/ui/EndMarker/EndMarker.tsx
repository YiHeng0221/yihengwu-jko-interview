import { clsx } from 'clsx'

export type EndMarkerProps = {
  /** 顯示文字，預設「愛心沒有底線」（街口列表 spec）*/
  label?: string
  className?: string
}

export function EndMarker({ label = '愛心沒有底線', className }: EndMarkerProps) {
  return (
    <div
      role="separator"
      aria-label="列表結束"
      className={clsx(
        'flex items-center justify-center gap-2 px-6 py-8 text-sm text-text-tertiary',
        className,
      )}
    >
      <span aria-hidden="true">❤️</span>
      <span>{label}</span>
    </div>
  )
}
