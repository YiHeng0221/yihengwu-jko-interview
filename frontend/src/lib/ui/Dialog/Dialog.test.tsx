import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
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

  it('renders dialog with aria-modal + aria-labelledby when open', () => {
    render(
      <Dialog open onClose={() => {}} title="選擇類別">
        <p>內容</p>
      </Dialog>,
    )
    const dialog = screen.getByRole('dialog', { name: '選擇類別' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby')
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

  it('triggers onClose on overlay click (AC-033)', async () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose} title="X">
        <p>inner</p>
      </Dialog>,
    )
    const overlay = screen.getByRole('dialog').parentElement!
    await userEvent.click(overlay)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not trigger onClose when clicking inside dialog (AC-033)', async () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose} title="X">
        <p>inner</p>
      </Dialog>,
    )
    await userEvent.click(screen.getByText('inner'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('traps focus: Tab from last focusable wraps to first (AC-034)', () => {
    render(
      <Dialog open onClose={() => {}} title="X">
        <button type="button">A</button>
        <button type="button">B</button>
      </Dialog>,
    )
    const buttons = screen.getAllByRole('button') // [close, A, B]
    const last = buttons[buttons.length - 1]!
    last.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(buttons[0])
  })

  it('traps focus: Shift+Tab from first focusable wraps to last (AC-034)', () => {
    render(
      <Dialog open onClose={() => {}} title="X">
        <button type="button">A</button>
        <button type="button">B</button>
      </Dialog>,
    )
    const buttons = screen.getAllByRole('button') // [close, A, B]
    const first = buttons[0]!
    first.focus()
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(buttons[buttons.length - 1])
  })
})
