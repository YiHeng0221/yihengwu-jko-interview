import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('autofocuses the input on mount', () => {
    render(<SearchBar value="" onChange={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: '請輸入關鍵字' })).toHaveFocus()
  })

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn()
    render(<SearchBar value="" onChange={vi.fn()} onClose={onClose} />)
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows clear button when value is non-empty', () => {
    render(<SearchBar value="愛心" onChange={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: '清除搜尋' })).toBeInTheDocument()
  })

  it('does not show clear button when value is empty', () => {
    render(<SearchBar value="" onChange={vi.fn()} onClose={vi.fn()} />)
    expect(screen.queryByRole('button', { name: '清除搜尋' })).not.toBeInTheDocument()
  })

  it('calls onClose when 取消 button is clicked', async () => {
    const onClose = vi.fn()
    render(<SearchBar value="" onChange={vi.fn()} onClose={onClose} />)
    await userEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('input has aria-controls pointing at search-results-region', () => {
    render(<SearchBar value="" onChange={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: '請輸入關鍵字' })).toHaveAttribute(
      'aria-controls',
      'search-results-region',
    )
  })
})
