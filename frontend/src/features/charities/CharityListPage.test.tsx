import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { CharityListPage } from './CharityListPage'

vi.mock('../../lib/env', () => ({
  env: { VITE_API_BASE_URL: 'http://localhost:3000' },
}))

vi.mock('../category/useCategories', () => ({
  useCategories: () => ({ data: [] }),
}))

const makeItem = (id: string) => ({
  id,
  title: `Org ${id}`,
  description: `Description ${id}`,
  tab: 'ORG',
  category_code: 'ELDER_CARE',
  logo_url: null,
  amount_raised: 0,
  amount_goal: null,
  created_at: '2026-05-01T00:00:00.000Z',
})

function setup(initialPath = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="*" element={children} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  render(<CharityListPage />, { wrapper: Wrapper })
  return { queryClient }
}

beforeAll(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn().mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }),
  )
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
})

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('CharityListPage', () => {
  it('renders TopBar with correct title', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
    )
    setup()
    expect(screen.getByRole('heading', { name: '所有捐款項目' })).toBeInTheDocument()
  })

  it('renders three tab buttons', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
    )
    setup()
    expect(screen.getByRole('tab', { name: '公益團體' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '捐款專案' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: '義賣商品' })).toBeInTheDocument()
  })

  it('shows skeleton placeholders while loading', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      () => new Promise(() => {}),
    )
    setup()
    expect(screen.getByLabelText('載入中')).toBeInTheDocument()
  })

  it('renders charity cards after data loads', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ items: [makeItem('c1'), makeItem('c2')], next_cursor: null }),
        { status: 200 },
      ),
    )
    setup()
    await waitFor(() => expect(screen.getByText('Org c1')).toBeInTheDocument())
    expect(screen.getByText('Org c2')).toBeInTheDocument()
  })

  it('shows EndMarker when all pages are loaded', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({ items: [makeItem('c1')], next_cursor: null }),
        { status: 200 },
      ),
    )
    setup()
    await waitFor(() => expect(screen.getByRole('separator', { name: '列表結束' })).toBeInTheDocument())
  })

  it('shows ErrorState when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 500 }),
    )
    setup()
    await waitFor(() =>
      expect(screen.getByRole('alert')).toBeInTheDocument(),
    )
  })

  it('shows inline ErrorState while preserving existing cards when pagination fetch fails', async () => {
    // Re-stub with a fresh mock so that vi.restoreAllMocks() in beforeEach
    // does not leave observe in an unusable state for this test.
    const mockObserver = { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() }
    let lastIoCallback: IntersectionObserverCallback | null = null
    vi.stubGlobal(
      'IntersectionObserver',
      vi.fn().mockImplementation((cb: IntersectionObserverCallback) => {
        lastIoCallback = cb
        return mockObserver
      }),
    )

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ items: [makeItem('c1')], next_cursor: 'cursor1' }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(new Response('{}', { status: 500 }))

    setup()

    await waitFor(() => expect(screen.getByText('Org c1')).toBeInTheDocument())

    act(() => {
      lastIoCallback?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByText('Org c1')).toBeInTheDocument()
  })

  it('defaults to ORG tab', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
    )
    setup()
    expect(screen.getByRole('tab', { name: '公益團體' })).toHaveAttribute('aria-selected', 'true')
  })

  it('reads tab from URL ?category=CAMPAIGN', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
    )
    setup('/?category=CAMPAIGN')
    expect(screen.getByRole('tab', { name: '捐款專案' })).toHaveAttribute('aria-selected', 'true')
  })

  it('smoke: SubRow 顯示「全部 ▾」按鈕與搜尋 IconButton（AC 2+3）', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
    )
    setup()
    expect(screen.getByRole('button', { name: '全部' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '搜尋' })).toBeInTheDocument()
  })

  it('點類別按鈕開啟 CategoryDrawerDialog（AC 4）', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
    )
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: '全部' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('點搜尋 IconButton 開啟 SearchOverlay（AC 5）', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
    )
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: '搜尋' }))
    expect(screen.getByRole('search')).toBeInTheDocument()
  })

  it('SearchOverlay 關閉後 SubRow 回原位（AC 5）', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ items: [], next_cursor: null }), { status: 200 }),
    )
    const user = userEvent.setup()
    setup()
    await user.click(screen.getByRole('button', { name: '搜尋' }))
    expect(screen.getByRole('search')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '取消' }))
    expect(screen.queryByRole('search')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '搜尋' })).toBeInTheDocument()
  })
})
