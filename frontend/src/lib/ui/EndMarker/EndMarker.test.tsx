import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EndMarker } from './EndMarker'

describe('EndMarker', () => {
  it('renders default 「愛心沒有底線」with role=separator + aria-label', () => {
    render(<EndMarker />)
    const sep = screen.getByRole('separator', { name: '列表結束' })
    expect(sep).toBeInTheDocument()
    expect(screen.getByText('愛心沒有底線')).toBeInTheDocument()
  })

  it('honours custom label', () => {
    render(<EndMarker label="到底囉" />)
    expect(screen.getByText('到底囉')).toBeInTheDocument()
  })

  it('merges custom className', () => {
    render(<EndMarker className="my-extra" />)
    expect(screen.getByRole('separator')).toHaveClass('my-extra')
  })

  it('renders two line dividers', () => {
    render(<EndMarker />)
    const lines = screen.getAllByTestId('end-marker-line')
    expect(lines).toHaveLength(2)
  })
})
