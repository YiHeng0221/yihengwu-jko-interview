import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { CategoryDrawerDialog } from './CategoryDrawerDialog'

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('CategoryDrawerDialog', () => {
  it('renders nothing when closed on desktop', () => {
    mockMatchMedia(true)
    render(
      <CategoryDrawerDialog open={false} onClose={vi.fn()}>
        <span>chips</span>
      </CategoryDrawerDialog>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders Dialog on desktop (≥768px)', () => {
    mockMatchMedia(true)
    render(
      <CategoryDrawerDialog open onClose={vi.fn()}>
        <span>chip grid</span>
      </CategoryDrawerDialog>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('chip grid')).toBeInTheDocument()
  })

  it('renders Drawer on mobile (<768px)', () => {
    mockMatchMedia(false)
    render(
      <CategoryDrawerDialog open onClose={vi.fn()}>
        <span>chip grid mobile</span>
      </CategoryDrawerDialog>,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('chip grid mobile')).toBeInTheDocument()
  })

  it('calls onClose on Escape key', async () => {
    mockMatchMedia(true)
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <CategoryDrawerDialog open onClose={onClose}>
        <span>content</span>
      </CategoryDrawerDialog>,
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when close button clicked', async () => {
    mockMatchMedia(false)
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <CategoryDrawerDialog open onClose={onClose}>
        <span>content</span>
      </CategoryDrawerDialog>,
    )
    await user.click(screen.getByRole('button', { name: '關閉' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('passes title to dialog', () => {
    mockMatchMedia(true)
    render(
      <CategoryDrawerDialog open onClose={vi.fn()} title="選擇類別">
        <span>content</span>
      </CategoryDrawerDialog>,
    )
    expect(screen.getByText('選擇類別')).toBeInTheDocument()
  })
})
