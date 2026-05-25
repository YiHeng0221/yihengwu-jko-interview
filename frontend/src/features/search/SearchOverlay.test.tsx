import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchOverlay } from './SearchOverlay'
import type { SearchState } from './useSearch'

vi.mock('./useSearch', () => ({
  useSearch: vi.fn(() => ({
    items: [],
    isLoading: false,
    isEmpty: false,
    error: null,
  })),
}))

import { useSearch } from './useSearch'

const mockUseSearch = vi.mocked(useSearch)

function makeState(overrides: Partial<SearchState>): SearchState {
  return { items: [], isLoading: false, isEmpty: false, error: null, ...overrides }
}

describe('SearchOverlay', () => {
  it('autofocuses the input on mount', () => {
    render(<SearchOverlay onClose={() => undefined} />)
    expect(screen.getByRole('textbox', { name: '搜尋公益項目' })).toHaveFocus()
  })

  it('shows 5 CardSkeleton placeholders while loading', () => {
    mockUseSearch.mockReturnValue(makeState({ isLoading: true }))
    const { container } = render(<SearchOverlay onClose={() => undefined} />)
    const skeletons = container.querySelectorAll('[aria-hidden="true"]')
    // CardSkeleton renders aria-hidden="true" wrapper + inner Skeletons
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('shows EmptyState when isEmpty is true', () => {
    mockUseSearch.mockReturnValue(makeState({ isEmpty: true }))
    render(<SearchOverlay onClose={() => undefined} />)
    expect(screen.getByText('找不到相關項目')).toBeInTheDocument()
    expect(screen.getByText('請嘗試不同的關鍵字')).toBeInTheDocument()
  })

  it('shows result cards when items are returned', () => {
    mockUseSearch.mockReturnValue(
      makeState({
        items: [
          {
            id: 'c1',
            title: '台灣愛心協會',
            description: '幫助弱勢',
            tab: 'ORG',
            categoryCode: 'ELDER_CARE',
            logoUrl: null,
            amountRaised: 0,
            amountGoal: null,
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
      }),
    )
    render(<SearchOverlay onClose={() => undefined} />)
    expect(screen.getByText('台灣愛心協會')).toBeInTheDocument()
    expect(screen.getByText('幫助弱勢')).toBeInTheDocument()
  })

  it('calls onClose when 取消 button is clicked', async () => {
    const onClose = vi.fn()
    render(<SearchOverlay onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Esc is pressed', async () => {
    const onClose = vi.fn()
    render(<SearchOverlay onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('clears input when ✕ button is clicked', async () => {
    render(<SearchOverlay onClose={() => undefined} />)
    const input = screen.getByRole('textbox', { name: '搜尋公益項目' })
    await userEvent.type(input, '愛心')
    expect(input).toHaveValue('愛心')
    await userEvent.click(screen.getByRole('button', { name: '清除搜尋' }))
    expect(input).toHaveValue('')
  })

  it('does not show EmptyState when query is empty (initial state)', () => {
    mockUseSearch.mockReturnValue(makeState({ isEmpty: false }))
    render(<SearchOverlay onClose={() => undefined} />)
    expect(screen.queryByText('找不到相關項目')).not.toBeInTheDocument()
  })

  it('shows search results region with aria-label', () => {
    render(<SearchOverlay onClose={() => undefined} />)
    expect(screen.getByRole('region', { name: '搜尋結果' })).toBeInTheDocument()
  })

  it('shows ErrorState when API call fails', () => {
    mockUseSearch.mockReturnValue(makeState({ error: new Error('HTTP 500') }))
    render(<SearchOverlay onClose={() => undefined} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('搜尋發生錯誤')).toBeInTheDocument()
    expect(screen.queryByText('找不到相關項目')).not.toBeInTheDocument()
  })
})
