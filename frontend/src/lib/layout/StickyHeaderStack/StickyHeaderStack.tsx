import { clsx } from 'clsx'
import type { ComponentPropsWithoutRef } from 'react'

export type StickyHeaderStackProps = ComponentPropsWithoutRef<'div'>

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
