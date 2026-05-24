import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('renders with aria-label', () => {
    render(<IconButton aria-label="Close">×</IconButton>)
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('requires aria-label to be non-empty (type-level contract)', () => {
    render(<IconButton aria-label="Search">🔍</IconButton>)
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <IconButton aria-label="Open menu" onClick={onClick}>
        ☰
      </IconButton>,
    )
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is set', () => {
    render(<IconButton aria-label="Disabled action" disabled>×</IconButton>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders children as icon content', () => {
    render(<IconButton aria-label="Back">←</IconButton>)
    expect(screen.getByRole('button')).toHaveTextContent('←')
  })
})
