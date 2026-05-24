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
