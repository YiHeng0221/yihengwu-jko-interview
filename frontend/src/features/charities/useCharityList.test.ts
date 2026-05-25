import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCharityList } from './useCharityList'

vi.mock('../../lib/env', () => ({
  env: { VITE_API_BASE_URL: 'http://localhost:3000' },
}))

const validPage = {
  items: [
    {
      id: 'c1',
      title: 'Test Org',
      description: 'desc',
      tab: 'ORG',
      category_codes: ['ELDER_CARE'],
      logo_url: null,
      amount_raised: 0,
      amount_goal: null,
      created_at: '2026-05-01T00:00:00.000Z',
    },
  ],
  next_cursor: null,
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useCharityList', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches charities with the correct URL', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(validPage), { status: 200 }),
    )

    const { result } = renderHook(() => useCharityList({ tab: 'ORG' }), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('category=ORG'),
      expect.objectContaining({ signal: expect.anything() }),
    )
    expect(result.current.data?.pages[0]?.items[0]?.title).toBe('Test Org')
  })

  it('includes q param when provided', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(validPage), { status: 200 }),
    )

    const { result } = renderHook(() => useCharityList({ tab: 'CAMPAIGN', q: '愛心' }), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('q=%E6%84%9B%E5%BF%83'),
      expect.anything(),
    )
  })

  it('exposes hasNextPage=false when next_cursor is null', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ...validPage, next_cursor: null }), { status: 200 }),
    )

    const { result } = renderHook(() => useCharityList({ tab: 'ORG' }), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.hasNextPage).toBe(false)
  })

  it('exposes hasNextPage=true when next_cursor is set', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ ...validPage, next_cursor: 'abc123' }), { status: 200 }),
    )

    const { result } = renderHook(() => useCharityList({ tab: 'ORG' }), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.hasNextPage).toBe(true)
  })

  it('transitions to error state on HTTP failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 500 }),
    )

    const { result } = renderHook(() => useCharityList({ tab: 'ORG' }), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBeInstanceOf(Error)
  })

  it('includes category_code param when categoryCode is provided', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(validPage), { status: 200 }),
    )

    const { result } = renderHook(
      () => useCharityList({ tab: 'ORG', categoryCode: 'ELDER_CARE' }),
      { wrapper: makeWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('category_code=ELDER_CARE'),
      expect.anything(),
    )
  })

  it('omits category_code param when categoryCode is null', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(validPage), { status: 200 }),
    )

    const { result } = renderHook(
      () => useCharityList({ tab: 'ORG', categoryCode: null }),
      { wrapper: makeWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const calledUrl = (fetchSpy.mock.calls[0]?.[0] as string) ?? ''
    expect(calledUrl).not.toContain('category_code=')
  })
})
