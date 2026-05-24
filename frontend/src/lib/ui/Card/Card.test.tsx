import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('renders title + description + slots', () => {
    render(
      <Card
        leading={<div data-testid="logo">logo</div>}
        title="慈善 X"
        description="幫助流浪動物"
        trailing={<span data-testid="chev">›</span>}
      />,
    )
    expect(screen.getByText('慈善 X')).toBeInTheDocument()
    expect(screen.getByText('幫助流浪動物')).toBeInTheDocument()
    expect(screen.getByTestId('logo')).toBeInTheDocument()
    expect(screen.getByTestId('chev')).toBeInTheDocument()
  })

  it('omits description block when not provided', () => {
    render(<Card title="只有標題" />)
    expect(screen.getByText('只有標題')).toBeInTheDocument()
    expect(screen.queryByText('幫助流浪動物')).not.toBeInTheDocument()
  })

  it('renders as button when as="button" + handles click', async () => {
    const onClick = vi.fn()
    render(<Card as="button" title="按我" onClick={onClick} />)
    const btn = screen.getByRole('button', { name: /按我/ })
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders as anchor when as="a"', () => {
    render(<Card as="a" href="https://example.com" title="導向外部" />)
    expect(screen.getByRole('link', { name: /導向外部/ })).toHaveAttribute(
      'href',
      'https://example.com',
    )
  })

  it('applies interactive style when interactive=true', () => {
    const { container } = render(<Card interactive title="可點" />)
    expect(container.firstChild).toHaveClass('cursor-pointer')
  })
})
