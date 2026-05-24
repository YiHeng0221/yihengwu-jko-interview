import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Drawer } from './Drawer'

describe('Drawer', () => {
  it('does not render when open=false', () => {
    render(
      <Drawer open={false} onClose={() => {}} title="X">
        <p>內容</p>
      </Drawer>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders with aria-modal + accessible name when open', () => {
    render(
      <Drawer open onClose={() => {}} title="選擇類別">
        <p>內容</p>
      </Drawer>,
    )
    expect(screen.getByRole('dialog', { name: '選擇類別' })).toHaveAttribute('aria-modal', 'true')
  })

  it('closes on Esc', async () => {
    const onClose = vi.fn()
    render(
      <Drawer open onClose={onClose} title="X">
        <button type="button">inner</button>
      </Drawer>,
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('closes when clicking close button', async () => {
    const onClose = vi.fn()
    render(
      <Drawer open onClose={onClose} title="X">
        <p>x</p>
      </Drawer>,
    )
    await userEvent.click(screen.getByRole('button', { name: '關閉' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes when clicking overlay', () => {
    const onClose = vi.fn()
    render(
      <Drawer open onClose={onClose} title="X">
        <p>x</p>
      </Drawer>,
    )
    const overlay = document.querySelector('.fixed.inset-0') as HTMLElement
    fireEvent.mouseDown(overlay)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('restores body scroll on unmount', () => {
    const { unmount } = render(
      <Drawer open onClose={() => {}} title="X">
        <p>x</p>
      </Drawer>,
    )
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
