import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OfflineBanner } from './OfflineBanner'

vi.mock('../hooks/useOnline', () => ({
  useOnline: vi.fn(),
}))

import { useOnline } from '../hooks/useOnline'

describe('OfflineBanner', () => {
  it('renders nothing when online', () => {
    vi.mocked(useOnline).mockReturnValue(true)
    const { container } = render(<OfflineBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders banner with status role when offline', () => {
    vi.mocked(useOnline).mockReturnValue(false)
    render(<OfflineBanner />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows 目前離線 message when offline', () => {
    vi.mocked(useOnline).mockReturnValue(false)
    render(<OfflineBanner />)
    expect(screen.getByText('目前離線')).toBeInTheDocument()
  })

  it('banner has no explicit aria-live (role="status" carries implicit polite live region per ARIA spec)', () => {
    vi.mocked(useOnline).mockReturnValue(false)
    render(<OfflineBanner />)
    expect(screen.getByRole('status')).not.toHaveAttribute('aria-live')
  })
})
