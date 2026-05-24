import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it.each(['primary', 'secondary', 'ghost'] as const)(
    'renders %s variant without error',
    (variant) => {
      render(<Button variant={variant}>Label</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    },
  )

  it.each(['sm', 'md', 'lg'] as const)(
    'renders %s size without error',
    (size) => {
      render(<Button size={size}>Label</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    },
  )

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Disabled</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Label</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })
})
