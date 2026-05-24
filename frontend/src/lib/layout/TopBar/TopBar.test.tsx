import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TopBar } from './TopBar'

describe('TopBar', () => {
  it('renders title as h1 + role=banner via header', () => {
    render(<TopBar title="所有捐款項目" />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: '所有捐款項目' })).toBeInTheDocument()
  })

  it('renders leading + trailing slots', () => {
    render(
      <TopBar
        title="X"
        leading={<button type="button" aria-label="返回">←</button>}
        trailing={<span data-testid="action">⋯</span>}
      />,
    )
    expect(screen.getByRole('button', { name: '返回' })).toBeInTheDocument()
    expect(screen.getByTestId('action')).toBeInTheDocument()
  })

  it('applies brand background + topbar height token (AC-028)', () => {
    const { container } = render(<TopBar title="X" />)
    const header = container.firstChild as HTMLElement
    expect(header.className).toContain('h-topbar')
    expect(header.className).toContain('bg-brand')
  })
})
