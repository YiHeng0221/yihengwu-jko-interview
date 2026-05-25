import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function ThrowError({ error }: { error: Error }): never {
  throw error
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>正常內容</div>
      </ErrorBoundary>,
    )
    expect(screen.getByText('正常內容')).toBeInTheDocument()
  })

  it('shows ErrorState with retry button for generic errors', () => {
    const error = new Error('伺服器錯誤')
    render(
      <ErrorBoundary>
        <ThrowError error={error} />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重試' })).toBeInTheDocument()
  })

  it('shows ErrorState with retry button for 5xx-like errors', () => {
    const error = Object.assign(new Error('Internal Server Error'), { status: 500 })
    render(
      <ErrorBoundary>
        <ThrowError error={error} />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('button', { name: '重試' })).toBeInTheDocument()
  })

  it('shows ErrorState without retry button for 401 errors', () => {
    const error = Object.assign(new Error('Unauthorized'), { status: 401 })
    render(
      <ErrorBoundary>
        <ThrowError error={error} />
      </ErrorBoundary>,
    )
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '重試' })).not.toBeInTheDocument()
  })

  it('resets and re-renders children after retry click', () => {
    let shouldThrow = true

    function ConditionalThrow() {
      if (shouldThrow) throw new Error('暫時錯誤')
      return <div>已復原</div>
    }

    render(
      <ErrorBoundary>
        <ConditionalThrow />
      </ErrorBoundary>,
    )

    expect(screen.getByRole('button', { name: '重試' })).toBeInTheDocument()

    shouldThrow = false
    fireEvent.click(screen.getByRole('button', { name: '重試' }))

    expect(screen.getByText('已復原')).toBeInTheDocument()
  })
})
