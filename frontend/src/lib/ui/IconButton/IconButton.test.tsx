import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { IconButton } from './IconButton'

const HeartIcon = () => <svg data-testid="icon" />

describe('IconButton', () => {
  it('renders accessible name from aria-label (AC-012)', () => {
    render(
      <IconButton aria-label="關閉搜尋">
        <HeartIcon />
      </IconButton>,
    )
    expect(screen.getByRole('button', { name: '關閉搜尋' })).toBeInTheDocument()
  })

  it('fires onClick', async () => {
    const onClick = vi.fn()
    render(
      <IconButton aria-label="返回" onClick={onClick}>
        <HeartIcon />
      </IconButton>,
    )
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies size class', () => {
    render(
      <IconButton aria-label="搜尋" size="lg">
        <HeartIcon />
      </IconButton>,
    )
    expect(screen.getByRole('button').className).toContain('size-12')
  })

  it('applies on-brand variant', () => {
    render(
      <IconButton aria-label="返回" variant="on-brand">
        <HeartIcon />
      </IconButton>,
    )
    expect(screen.getByRole('button').className).toContain('text-text-on-brand')
  })
})
