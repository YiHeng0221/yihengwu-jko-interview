import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('renders with default label "載入中"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status', { name: '載入中' })).toBeInTheDocument()
  })

  it('honours custom label', () => {
    render(<Spinner label="搜尋中" />)
    expect(screen.getByRole('status', { name: '搜尋中' })).toBeInTheDocument()
  })

  it('drops aria-label when label is empty string (parent owns label)', () => {
    render(<Spinner label="" />)
    const status = screen.getByRole('status')
    expect(status).not.toHaveAttribute('aria-label')
  })

  it('applies size class', () => {
    render(<Spinner size="lg" />)
    const inner = screen.getByRole('status').firstElementChild
    expect(inner?.className).toContain('size-10')
  })
})
