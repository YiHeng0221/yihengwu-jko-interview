import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CharityCard } from './CharityCard'

describe('CharityCard', () => {
  it('renders name and logo image', () => {
    render(<CharityCard logoSrc="https://example.com/logo.png" name="台灣動物保護協會" />)
    expect(screen.getByText('台灣動物保護協會')).toBeInTheDocument()
    const logo = screen.getByTestId('charity-logo')
    expect(logo).toHaveAttribute('src', 'https://example.com/logo.png')
  })

  it('renders description when provided', () => {
    render(
      <CharityCard
        logoSrc="https://example.com/logo.png"
        name="台灣動物保護協會"
        description="幫助流浪動物"
      />,
    )
    expect(screen.getByText('幫助流浪動物')).toBeInTheDocument()
  })

  it('omits description when not provided', () => {
    render(<CharityCard logoSrc="https://example.com/logo.png" name="僅標題" />)
    expect(screen.queryByText('幫助流浪動物')).not.toBeInTheDocument()
  })

  it('renders as article element with accessible name', () => {
    render(<CharityCard logoSrc="https://example.com/logo.png" name="台灣動物保護協會" />)
    expect(screen.getByRole('article', { name: '台灣動物保護協會' })).toBeInTheDocument()
  })

  it('logo has correct dimensions', () => {
    render(<CharityCard logoSrc="https://example.com/logo.png" name="Test" />)
    const logo = screen.getByTestId('charity-logo')
    expect(logo).toHaveAttribute('width', '48')
    expect(logo).toHaveAttribute('height', '48')
  })
})
