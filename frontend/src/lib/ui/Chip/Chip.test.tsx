import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Chip } from './Chip'

describe('Chip', () => {
  it('renders label text', () => {
    render(<Chip label="兒少照護" />)
    expect(screen.getByRole('button', { name: '兒少照護' })).toBeInTheDocument()
  })

  it('is not pressed by default', () => {
    render(<Chip label="全部" />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
  })

  it('reflects active state via aria-pressed', () => {
    render(<Chip label="全部" active />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Chip label="動物保護" onClick={onClick} />)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is set', () => {
    render(<Chip label="身心障礙服務" disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies custom className', () => {
    render(<Chip label="全部" className="extra-class" />)
    expect(screen.getByRole('button')).toHaveClass('extra-class')
  })
})
