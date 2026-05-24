import '@testing-library/jest-dom/vitest'
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useOnline } from './useOnline'

describe('useOnline', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when navigator.onLine is true', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    const { result } = renderHook(() => useOnline())
    expect(result.current).toBe(true)
  })

  it('returns false when navigator.onLine is false', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    const { result } = renderHook(() => useOnline())
    expect(result.current).toBe(false)
  })

  it('transitions to false when offline event fires', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    const { result } = renderHook(() => useOnline())
    expect(result.current).toBe(true)

    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    expect(result.current).toBe(false)
  })

  it('transitions to true when online event fires', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    const { result } = renderHook(() => useOnline())
    expect(result.current).toBe(false)

    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    expect(result.current).toBe(true)
  })

  it('re-checks navigator.onLine on visibilitychange when page is visible', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
    const { result } = renderHook(() => useOnline())
    expect(result.current).toBe(true)

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(result.current).toBe(false)
  })

  it('skips re-check on visibilitychange when page is hidden', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    const { result } = renderHook(() => useOnline())
    expect(result.current).toBe(true)

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(result.current).toBe(true)
  })
})
