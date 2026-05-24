import clsx from 'clsx'
import type { InputHTMLAttributes, ReactNode, Ref } from 'react'

type InputSize = 'sm' | 'md' | 'lg'

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  /** 左側 icon（例如 🔍）— `aria-hidden` 自動帶上 */
  leadingIcon?: ReactNode
  /** 右側 slot，常見：清除 ✕ button。請自帶 `aria-label`。 */
  trailingSlot?: ReactNode
  inputSize?: InputSize
  invalid?: boolean
  ref?: Ref<HTMLInputElement>
}

const SIZE_CLASSES: Record<InputSize, string> = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-base',
  lg: 'h-12 text-lg',
}

export function Input({
  leadingIcon,
  trailingSlot,
  inputSize = 'md',
  invalid = false,
  className,
  disabled,
  ref,
  ...rest
}: InputProps) {
  return (
    <label
      className={clsx(
        'flex items-center gap-2 rounded-chip border bg-surface px-3 transition-colors',
        'focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/30',
        invalid ? 'border-danger' : 'border-border',
        disabled && 'cursor-not-allowed bg-surface-muted opacity-60',
        SIZE_CLASSES[inputSize],
        className,
      )}
    >
      {leadingIcon && (
        <span aria-hidden="true" className="shrink-0 text-text-secondary">
          {leadingIcon}
        </span>
      )}
      <input
        ref={ref}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-text-tertiary disabled:cursor-not-allowed"
        {...rest}
      />
      {trailingSlot && <span className="shrink-0">{trailingSlot}</span>}
    </label>
  )
}
