import { renderHook, act } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMediaQuery } from './useMediaQuery'

function mockMatchMedia(initialMatches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>()
  const mql = {
    matches: initialMatches,
    addEventListener: vi.fn((_: string, l: (e: MediaQueryListEvent) => void) => listeners.add(l)),
    removeEventListener: vi.fn((_: string, l: (e: MediaQueryListEvent) => void) => listeners.delete(l)),
  }
  vi.stubGlobal('matchMedia', vi.fn(() => mql))
  return { mql, fire: (matches: boolean) => listeners.forEach(l => l({ matches } as MediaQueryListEvent)) }
}

afterEach(() => vi.unstubAllGlobals())

describe('useMediaQuery', () => {
  it('reflects initial matchMedia result', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(true)
  })

  it('updates on change event', () => {
    const { fire } = mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    expect(result.current).toBe(false)
    act(() => fire(true))
    expect(result.current).toBe(true)
  })

  it('cleans up listener on unmount', () => {
    const { mql } = mockMatchMedia(false)
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'))
    unmount()
    expect(mql.removeEventListener).toHaveBeenCalled()
  })
})
