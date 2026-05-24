import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders title + role=status', () => {
    render(<EmptyState title="找不到結果" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('找不到結果')).toBeInTheDocument()
  })

  it('renders description + action when provided', () => {
    render(
      <EmptyState
        title="找不到結果"
        description="試試其他關鍵字"
        action={<button type="button">清除搜尋</button>}
      />,
    )
    expect(screen.getByText('試試其他關鍵字')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '清除搜尋' })).toBeInTheDocument()
  })

  it('omits action when not provided', () => {
    render(<EmptyState title="僅標題" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('marks icon container aria-hidden', () => {
    render(<EmptyState icon={<svg data-testid="icon" />} title="X" />)
    const icon = screen.getByTestId('icon')
    expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders default no-data image when no icon provided', () => {
    render(<EmptyState />)
    const img = screen.getByTestId('empty-no-data-img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('width', '144')
    expect(img).toHaveAttribute('height', '144')
  })

  it('renders default title and description', () => {
    render(<EmptyState />)
    expect(screen.getByText('查無相關資料')).toBeInTheDocument()
    expect(screen.getByText('請調整關鍵字再重新搜尋')).toBeInTheDocument()
  })
})
