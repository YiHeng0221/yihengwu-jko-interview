import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MerchandiseCard } from './MerchandiseCard'

describe('MerchandiseCard', () => {
  it('renders product title', () => {
    render(<MerchandiseCard title="兒童繪本義賣套書" />)
    expect(screen.getByText('兒童繪本義賣套書')).toBeInTheDocument()
  })

  it('renders as article with accessible name', () => {
    render(<MerchandiseCard title="兒童繪本義賣套書" />)
    expect(screen.getByRole('article', { name: '兒童繪本義賣套書' })).toBeInTheDocument()
  })

  it('renders org name when provided', () => {
    render(<MerchandiseCard title="兒童繪本義賣套書" orgName="台灣兒童保育協會" />)
    expect(screen.getByText('台灣兒童保育協會')).toBeInTheDocument()
  })

  it('omits org name when not provided', () => {
    render(<MerchandiseCard title="兒童繪本義賣套書" />)
    expect(screen.queryByText('台灣兒童保育協會')).not.toBeInTheDocument()
  })

  it('renders price in TWD format', () => {
    render(<MerchandiseCard title="兒童繪本義賣套書" priceNtd={740} />)
    expect(screen.getByText('TWD 740')).toBeInTheDocument()
  })

  it('omits price when not provided', () => {
    render(<MerchandiseCard title="兒童繪本義賣套書" />)
    expect(screen.queryByText(/TWD/)).not.toBeInTheDocument()
  })

  it('renders product image when src provided', () => {
    const { container } = render(
      <MerchandiseCard
        title="兒童繪本義賣套書"
        productImageSrc="https://example.com/product.png"
      />,
    )
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://example.com/product.png')
  })
})
