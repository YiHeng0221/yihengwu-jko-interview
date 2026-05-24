import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SubRow } from './SubRow'

describe('SubRow', () => {
  it('renders leading + trailing in separate slots', () => {
    render(
      <SubRow
        leading={<button type="button">全部 ▾</button>}
        trailing={<button type="button" aria-label="搜尋">🔍</button>}
      />,
    )
    expect(screen.getByRole('button', { name: '全部 ▾' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '搜尋' })).toBeInTheDocument()
  })

  it('applies subrow height + border + flex-between layout', () => {
    render(<SubRow data-testid="subrow" />)
    const root = screen.getByTestId('subrow')
    expect(root.className).toContain('h-subrow')
    expect(root.className).toContain('justify-between')
  })

  it('merges custom className', () => {
    render(<SubRow data-testid="subrow" className="custom" />)
    expect(screen.getByTestId('subrow').className).toContain('custom')
  })
})
