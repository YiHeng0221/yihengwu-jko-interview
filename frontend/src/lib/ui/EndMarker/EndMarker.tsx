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
      className={clsx('flex items-center justify-center gap-2 px-6 py-8', className)}
    >
      <div className="h-px w-20 bg-[#9fa0ab]" data-testid="end-marker-line" />
      <span className="font-normal text-[13px] text-[#9fa0ab]">{label}</span>
      <div className="h-px w-20 bg-[#9fa0ab]" data-testid="end-marker-line" />
    </div>
  )
}
