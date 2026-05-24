import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Dialog } from './Dialog'

describe('Dialog', () => {
  it('does not render content when open=false', () => {
    render(
      <Dialog open={false} onClose={() => {}} title="X">
        <p>內容</p>
      </Dialog>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders dialog with aria-modal + aria-label when open', () => {
    render(
      <Dialog open onClose={() => {}} title="選擇類別">
        <p>內容</p>
      </Dialog>,
    )
    const dialog = screen.getByRole('dialog', { name: '選擇類別' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByText('內容')).toBeInTheDocument()
  })

  it('triggers onClose on Esc (AC-033)', async () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose} title="X">
        <button type="button">inner</button>
      </Dialog>,
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('triggers onClose on close button click', async () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose} title="X">
        <p>x</p>
      </Dialog>,
    )
    await userEvent.click(screen.getByRole('button', { name: '關閉' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('focuses first focusable element on open', async () => {
    render(
      <Dialog open onClose={() => {}} title="X">
        <button type="button">first</button>
        <button type="button">second</button>
      </Dialog>,
    )
    // close button is rendered first (in header), so it gets focus
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: '關閉' }),
    )
  })

  it('restores body scroll on unmount', () => {
    const { unmount } = render(
      <Dialog open onClose={() => {}} title="X">
        <p>x</p>
      </Dialog>,
    )
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
