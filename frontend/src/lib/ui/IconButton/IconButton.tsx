import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { cn } from '../../cn/cn'

type IconButtonVariant = 'primary' | 'ghost' | 'on-brand'
type IconButtonSize = 'sm' | 'md' | 'lg'

export type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & {
  /** 一定要寫 — IconButton 沒有可見文字，screen reader 需要這個 */
  'aria-label': string
  variant?: IconButtonVariant
  size?: IconButtonSize
  ref?: Ref<HTMLButtonElement>
  children: ReactNode
}

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  primary:
    'bg-brand text-text-on-brand hover:bg-brand-dark disabled:bg-border disabled:text-text-tertiary',
  ghost:
    'bg-transparent text-text-primary hover:bg-surface-muted disabled:text-text-tertiary',
  'on-brand':
    'bg-transparent text-text-on-brand hover:bg-brand-dark/30 disabled:text-text-on-brand/40',
}

const SIZE_CLASSES: Record<IconButtonSize, string> = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  className,
  children,
  type = 'button',
  ref,
  ...rest
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-button transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
