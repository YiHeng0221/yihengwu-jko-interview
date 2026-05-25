import '@testing-library/jest-dom/vitest'
import { act, render, renderHook, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { CHARITY_TABS, DEFAULT_TAB } from './constants'
import { useTabSync } from './useTabSync'

function wrap(initialPath: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="*" element={children} />
        </Routes>
      </MemoryRouter>
    )
  }
}

describe('useTabSync', () => {
  it('returns DEFAULT_TAB when ?category is missing', () => {
    const { result } = renderHook(() => useTabSync(), { wrapper: wrap('/') })
    expect(result.current[0]).toBe(DEFAULT_TAB)
  })

  it('returns the URL value when valid', () => {
    const { result } = renderHook(() => useTabSync(), {
      wrapper: wrap('/?category=CAMPAIGN'),
    })
    expect(result.current[0]).toBe('CAMPAIGN')
  })

  it('falls back to DEFAULT_TAB when URL value is invalid', () => {
    const { result } = renderHook(() => useTabSync(), {
      wrapper: wrap('/?category=BANANA'),
    })
    expect(result.current[0]).toBe(DEFAULT_TAB)
  })

  it('updates URL when setTab is called', () => {
    const { result } = renderHook(() => useTabSync(), { wrapper: wrap('/') })
    act(() => {
      result.current[1]('MERCHANDISE')
    })
    expect(result.current[0]).toBe('MERCHANDISE')
  })

  it('CHARITY_TABS contains exactly 3 known values', () => {
    expect(CHARITY_TABS).toEqual(['ORG', 'CAMPAIGN', 'MERCHANDISE'])
  })

  it('integrates with a real click flow that switches tabs', async () => {
    function Demo() {
      const [tab, setTab] = useTabSync()
      return (
        <div>
          <span data-testid="current">{tab}</span>
          <button type="button" onClick={() => setTab('CAMPAIGN')}>
            switch
          </button>
        </div>
      )
    }
    render(
      <MemoryRouter initialEntries={['/']}>
        <Demo />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('current')).toHaveTextContent('ORG')
    await userEvent.click(screen.getByRole('button', { name: 'switch' }))
    expect(screen.getByTestId('current')).toHaveTextContent('CAMPAIGN')
  })
})
