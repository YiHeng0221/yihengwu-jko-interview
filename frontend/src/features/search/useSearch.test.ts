import '@testing-library/jest-dom/vitest'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CharityTab } from '../charities/constants'
import { useSearch } from './useSearch'

vi.mock('../../lib/env', () => ({
  env: { VITE_API_BASE_URL: 'http://localhost:3000' },
}))

const mockFetch = vi.fn<typeof fetch>()

describe('useSearch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch)
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    mockFetch.mockReset()
    vi.restoreAllMocks()
  })

  it('returns INITIAL_STATE when query is empty', () => {
    const { result } = renderHook(() => useSearch('', 'ORG'))
    expect(result.current).toEqual({ items: [], isLoading: false, isEmpty: false, error: null })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('does not fetch before 300ms debounce', () => {
    renderHook(() => useSearch('台灣', 'ORG'))
    act(() => vi.advanceTimersByTime(299))
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('fetches after 300ms debounce with correct URL including category', () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
    )
    renderHook(() => useSearch('台灣', 'ORG'))
    act(() => vi.advanceTimersByTime(300))
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/charities?q=%E5%8F%B0%E7%81%A3&category=ORG',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('sets isLoading true synchronously when debounce fires', () => {
    mockFetch.mockReturnValue(new Promise<Response>(() => undefined))
    const { result } = renderHook(() => useSearch('愛', 'ORG'))
    act(() => vi.advanceTimersByTime(300))
    expect(result.current.isLoading).toBe(true)
  })

  it('sets isEmpty true when API returns empty items', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
    )
    const { result } = renderHook(() => useSearch('zzz', 'ORG'))
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(result.current.isEmpty).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('returns mapped camelCase items on success', async () => {
    const wireItem = {
      id: 'c1',
      title: '台灣愛心',
      description: '幫助更多人',
      tab: 'ORG',
      category_code: 'ELDER_CARE',
      logo_url: null,
      amount_raised: 0,
      amount_goal: null,
      created_at: '2026-01-01T00:00:00Z',
    }
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ items: [wireItem], next_cursor: null }), { status: 200 }),
    )
    const { result } = renderHook(() => useSearch('愛心', 'ORG'))
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0]).toMatchObject({
      id: 'c1',
      title: '台灣愛心',
      categoryCode: 'ELDER_CARE',
      logoUrl: null,
      amountRaised: 0,
    })
    expect(result.current.isEmpty).toBe(false)
  })

  it('sets error on HTTP error response', async () => {
    mockFetch.mockResolvedValue(new Response('', { status: 500 }))
    const { result } = renderHook(() => useSearch('fail', 'ORG'))
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.error?.message).toMatch(/HTTP 500/)
  })

  it('sets error when backend returns invalid shape (ZodError)', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ items: null, next_cursor: null }), { status: 200 }),
    )
    const { result } = renderHook(() => useSearch('bad', 'ORG'))
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(result.current.error).toBeInstanceOf(Error)
    expect(result.current.items).toHaveLength(0)
    expect(result.current.isLoading).toBe(false)
  })

  it('aborts previous in-flight fetch when query changes mid-debounce', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
    )
    const { rerender } = renderHook(({ q }) => useSearch(q, 'ORG'), {
      initialProps: { q: 'a' },
    })
    // advance 200ms — 'a' debounce has NOT fired yet
    act(() => vi.advanceTimersByTime(200))
    rerender({ q: 'ab' })
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    // Only one fetch — for 'ab', not 'a'
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('q=ab'),
      expect.any(Object),
    )
  })

  it('ignores AbortError and keeps error null', async () => {
    mockFetch.mockRejectedValue(
      Object.assign(new Error('aborted'), { name: 'AbortError' }),
    )
    const { result } = renderHook(() => useSearch('abort', 'ORG'))
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(result.current.error).toBeNull()
  })

  it('resets to INITIAL_STATE immediately when query is cleared', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
    )
    const { result, rerender } = renderHook(({ q }) => useSearch(q, 'ORG'), {
      initialProps: { q: '愛心' },
    })
    await act(async () => {
      await vi.runAllTimersAsync()
    })
    expect(result.current.isEmpty).toBe(true)

    rerender({ q: '' })
    expect(result.current).toEqual({ items: [], isLoading: false, isEmpty: false, error: null })
  })

  it('tab change fires fetch with new category without waiting 300ms', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
    )
    const { rerender } = renderHook(({ tab }) => useSearch('test', tab), {
      initialProps: { tab: 'ORG' as CharityTab },
    })
    // let first fetch complete
    await act(async () => { await vi.runAllTimersAsync() })
    mockFetch.mockClear()

    rerender({ tab: 'CAMPAIGN' as CharityTab })
    // advance only 1ms — well under the 300ms debounce
    await act(async () => { vi.advanceTimersByTime(1) })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('category=CAMPAIGN'),
      expect.any(Object),
    )
  })

  it('tab change URL includes new category value', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
    )
    const { rerender } = renderHook(({ tab }) => useSearch('keyword', tab), {
      initialProps: { tab: 'ORG' as CharityTab },
    })
    await act(async () => { await vi.runAllTimersAsync() })

    rerender({ tab: 'MERCHANDISE' as CharityTab })
    await act(async () => { await vi.runAllTimersAsync() })

    const lastCall = mockFetch.mock.calls.at(-1)
    expect(lastCall?.[0]).toContain('category=MERCHANDISE')
    expect(lastCall?.[0]).toContain('q=keyword')
  })
})
