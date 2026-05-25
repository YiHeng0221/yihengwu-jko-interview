import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CampaignCard } from './CampaignCard'

describe('CampaignCard', () => {
  it('renders campaign title', () => {
    render(<CampaignCard title="偏鄉兒童閱讀計畫" />)
    expect(screen.getByText('偏鄉兒童閱讀計畫')).toBeInTheDocument()
  })

  it('renders as article with accessible name', () => {
    render(<CampaignCard title="偏鄉兒童閱讀計畫" />)
    expect(screen.getByRole('article', { name: '偏鄉兒童閱讀計畫' })).toBeInTheDocument()
  })

  it('renders org name when provided', () => {
    render(<CampaignCard title="偏鄉兒童閱讀計畫" orgName="台灣兒童保育協會" />)
    expect(screen.getByText('台灣兒童保育協會')).toBeInTheDocument()
  })

  it('omits org name when not provided', () => {
    render(<CampaignCard title="僅標題" />)
    expect(screen.queryByText('台灣兒童保育協會')).not.toBeInTheDocument()
  })

  it('renders banner image when src provided', () => {
    const { container } = render(
      <CampaignCard title="偏鄉兒童閱讀計畫" bannerSrc="https://example.com/banner.png" />,
    )
    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', 'https://example.com/banner.png')
  })

  it('renders tag chips', () => {
    render(
      <CampaignCard
        title="偏鄉兒童閱讀計畫"
        tags={['身心障礙服務', '特殊醫療', '弱勢扶貧']}
      />,
    )
    expect(screen.getByText('身心障礙服務')).toBeInTheDocument()
    expect(screen.getByText('特殊醫療')).toBeInTheDocument()
    expect(screen.getByText('弱勢扶貧')).toBeInTheDocument()
  })

  it('renders no tags when tags array is empty', () => {
    const { container } = render(<CampaignCard title="偏鄉兒童閱讀計畫" tags={[]} />)
    expect(container.querySelectorAll('span').length).toBe(0)
  })
})
