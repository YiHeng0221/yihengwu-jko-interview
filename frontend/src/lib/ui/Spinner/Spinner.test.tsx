import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('renders with default 「載入中」aria-label + role=status', () => {
    render(<Spinner />)
    expect(screen.getByRole('status', { name: '載入中' })).toBeInTheDocument()
  })

  it('honours custom aria-label', () => {
    render(<Spinner aria-label="搜尋中" />)
    expect(screen.getByRole('status', { name: '搜尋中' })).toBeInTheDocument()
  })

  it('drops aria-label when empty string (parent owns label)', () => {
    render(<Spinner aria-label="" />)
    expect(screen.getByRole('status')).not.toHaveAttribute('aria-label')
  })

  it('renders 8 tick rect elements (iOS activity indicator)', () => {
    const { container } = render(<Spinner />)
    const ticks = container.querySelectorAll('rect.spinner-tick')
    expect(ticks).toHaveLength(8)
  })

  it.each([
    ['sm', 16],
    ['md', 24],
    ['lg', 40],
  ] as const)('renders %s size with canvas %ipx', (size, canvasPx) => {
    const { container } = render(<Spinner size={size} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', String(canvasPx))
    expect(svg).toHaveAttribute('height', String(canvasPx))
  })

  it('each tick has a distinct animation-delay (staggered fade)', () => {
    const { container } = render(<Spinner />)
    const ticks = container.querySelectorAll<HTMLElement>('rect.spinner-tick')
    const delays = Array.from(ticks).map((el) => el.style.animationDelay)
    // all delays should be unique (8 different values offset by 1/8 second)
    expect(new Set(delays).size).toBe(8)
  })
})
