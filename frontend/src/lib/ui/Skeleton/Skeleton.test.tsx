import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CardSkeleton, Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders with default line shape + aria-hidden', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstChild as HTMLElement
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el.className).toContain('rounded')
    expect(el.className).toContain('animate-pulse')
  })

  it('honours shape variants', () => {
    const { rerender, container } = render(<Skeleton shape="circle" />)
    expect((container.firstChild as HTMLElement).className).toContain('rounded-full')

    rerender(<Skeleton shape="block" />)
    expect((container.firstChild as HTMLElement).className).toContain('rounded-card')
  })

  it('merges custom className', () => {
    const { container } = render(<Skeleton className="w-32" />)
    expect((container.firstChild as HTMLElement).className).toContain('w-32')
  })
})

describe('CardSkeleton', () => {
  it('renders aria-hidden composite (circle + 2 lines)', () => {
    const { container } = render(<CardSkeleton />)
    const root = container.firstChild as HTMLElement
    expect(root).toHaveAttribute('aria-hidden', 'true')
    expect(root.querySelectorAll('span').length).toBeGreaterThanOrEqual(3)
  })
})
