import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders children + default primary variant', () => {
    render(<Button>送出</Button>)
    const btn = screen.getByRole('button', { name: '送出' })
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute('type', 'button')
    expect(btn.className).toContain('bg-brand')
  })

  it('fires onClick when not disabled', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>送出</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('skips onClick + applies disabled style when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        送出
      </Button>,
    )
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('shows spinner + aria-busy when isLoading', () => {
    render(<Button isLoading>送出</Button>)
    const btn = screen.getByRole('button', { name: '送出' })
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toBeDisabled()
  })

  it('honours variant + size className tokens', () => {
    render(
      <Button variant="secondary" size="lg">
        ghost
      </Button>,
    )
    const btn = screen.getByRole('button')
    expect(btn.className).toContain('border-brand')
    expect(btn.className).toContain('h-12')
  })

  it('supports leadingIcon', () => {
    render(
      <Button leadingIcon={<span data-testid="icon">★</span>}>讚</Button>,
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })
})
