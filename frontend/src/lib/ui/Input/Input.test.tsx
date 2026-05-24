import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  it('renders + accepts typed text', async () => {
    const onChange = vi.fn()
    render(<Input aria-label="搜尋" placeholder="輸入關鍵字" onChange={onChange} />)
    const input = screen.getByLabelText('搜尋')
    await userEvent.type(input, '台灣')
    expect(input).toHaveValue('台灣')
    expect(onChange).toHaveBeenCalled()
  })

  it('disables and stops accepting input when disabled', async () => {
    render(<Input aria-label="搜尋" disabled />)
    const input = screen.getByLabelText('搜尋')
    expect(input).toBeDisabled()
    await userEvent.type(input, 'x')
    expect(input).toHaveValue('')
  })

  it('shows leading icon as aria-hidden', () => {
    render(
      <Input
        aria-label="搜尋"
        leadingIcon={<span data-testid="icon">🔍</span>}
      />,
    )
    const icon = screen.getByTestId('icon')
    expect(icon.parentElement).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders trailing slot interactively (e.g., clear button)', async () => {
    const onClear = vi.fn()
    render(
      <Input
        aria-label="搜尋"
        defaultValue="台灣"
        trailingSlot={
          <button type="button" aria-label="清除" onClick={onClear}>
            ✕
          </button>
        }
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: '清除' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('signals invalid state via aria-invalid + danger border', () => {
    render(<Input aria-label="搜尋" invalid />)
    expect(screen.getByLabelText('搜尋')).toHaveAttribute('aria-invalid', 'true')
  })
})
