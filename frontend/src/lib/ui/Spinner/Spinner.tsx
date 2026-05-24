import { clsx } from 'clsx'

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps {
  size?: SpinnerSize
  /** screen-reader label，預設「載入中」。設 '' 來讓父層自帶 aria-label */
  'aria-label'?: string
  className?: string
}

/** SVG canvas + tick 尺寸對應表，各 size 獨立調整視覺重量 */
const SIZE_SPEC: Record<SpinnerSize, { canvas: number; tickW: number; tickH: number }> = {
  sm: { canvas: 16, tickW: 1.5, tickH: 4 },
  md: { canvas: 24, tickW: 2, tickH: 5 },
  lg: { canvas: 40, tickW: 2.5, tickH: 7 },
}

const TICK_COUNT = 8
const ANIMATION_DURATION = 1 // seconds

/**
 * iOS-style activity indicator — 8 個短圓角 tick 繞圓心 45° 排列，
 * 各 tick `animation-delay` 錯開 1/8 秒 → 視覺上「一條亮的在轉」漸隱效果。
 *
 * 顏色用 `currentColor`，預設 `var(--color-text-tertiary)`，可透過 `className`
 * 覆寫（例如 `text-brand`）。
 *
 * @keyframes 與 `.spinner-tick` class 定義在 `frontend/src/styles/theme.css`。
 */
export function Spinner({ size = 'md', 'aria-label': ariaLabel = '載入中', className }: SpinnerProps) {
  const { canvas, tickW, tickH } = SIZE_SPEC[size]
  const center = 12 // viewBox 24×24，所有 size 都用同一 viewBox + scale
  const tickX = center - tickW / 2
  const tickY = 2.5

  return (
    <span
      role="status"
      aria-label={ariaLabel || undefined}
      className={clsx('inline-flex text-text-tertiary', className)}
    >
      <svg
        width={canvas}
        height={canvas}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {Array.from({ length: TICK_COUNT }, (_, i) => (
          <rect
            key={i}
            x={tickX}
            y={tickY}
            width={tickW}
            height={tickH}
            rx={tickW / 2}
            fill="currentColor"
            transform={`rotate(${(360 / TICK_COUNT) * i} ${center} ${center})`}
            className="spinner-tick"
            style={{ animationDelay: `${-(ANIMATION_DURATION - (ANIMATION_DURATION / TICK_COUNT) * i)}s` }}
          />
        ))}
      </svg>
    </span>
  )
}
