import { render, screen } from '@testing-library/react'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('renders with default aria-label "Loading"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('renders with custom aria-label', () => {
    render(<Spinner aria-label="Fetching results" />)
    expect(
      screen.getByRole('status', { name: 'Fetching results' }),
    ).toBeInTheDocument()
  })

  it.each(['sm', 'md', 'lg'] as const)(
    'renders %s size without error',
    (size) => {
      render(<Spinner size={size} />)
      expect(screen.getByRole('status')).toBeInTheDocument()
    },
  )
})
