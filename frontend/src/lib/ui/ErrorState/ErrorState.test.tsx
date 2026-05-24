import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ErrorState } from './ErrorState'

describe('ErrorState', () => {
  it('renders default title + description + retry button + role=alert', () => {
    render(<ErrorState onRetry={() => {}} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('發生錯誤')).toBeInTheDocument()
    expect(screen.getByText('請稍後再試或聯絡支援')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重試' })).toBeInTheDocument()
  })

  it('fires onRetry when clicking the retry button', async () => {
    const onRetry = vi.fn()
    render(<ErrorState onRetry={onRetry} />)
    await userEvent.click(screen.getByRole('button', { name: '重試' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('hides retry when retryLabel is null', () => {
    render(<ErrorState retryLabel={null} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('honours custom title / description / retryLabel', () => {
    render(
      <ErrorState
        title="伺服器爆炸"
        description="工程師正在搶救"
        retryLabel="再來一次"
        onRetry={() => {}}
      />,
    )
    expect(screen.getByText('伺服器爆炸')).toBeInTheDocument()
    expect(screen.getByText('工程師正在搶救')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '再來一次' })).toBeInTheDocument()
  })
})
