import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Chip } from './Chip'

describe('Chip', () => {
  it('renders label + role=button + aria-pressed=false by default', () => {
    render(<Chip label="動保" />)
    const btn = screen.getByRole('button', { name: '動保' })
    expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  it('applies rounded-button radius class', () => {
    render(<Chip label="動保" />)
    expect(screen.getByRole('button')).toHaveClass('rounded-button')
  })

  it('inactive chip: gray bg, no standalone border class', () => {
    render(<Chip label="動保" />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('bg-surface-muted')
    expect(btn).toHaveClass('text-text-primary')
    expect(btn).not.toHaveClass('border')
  })

  it('active chip: outlined — red border + white bg + red text', () => {
    render(<Chip label="動保" active />)
    const btn = screen.getByRole('button')
    expect(btn).toHaveClass('border')
    expect(btn).toHaveClass('border-brand')
    expect(btn).toHaveClass('bg-surface')
    expect(btn).toHaveClass('text-brand')
  })

  it('reflects active state via aria-pressed', () => {
    render(<Chip label="動保" active />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('fires onClick when not disabled', async () => {
    const onClick = vi.fn()
    render(<Chip label="動保" onClick={onClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn()
    render(<Chip label="動保" disabled onClick={onClick} />)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })
})
