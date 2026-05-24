import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Tabs } from './Tabs'

const items = [
  { value: 'ORG', label: '公益團體' },
  { value: 'CAMPAIGN', label: '捐款專案' },
  { value: 'MERCHANDISE', label: '義賣商品' },
] as const

describe('Tabs', () => {
  it('renders all tabs with role + aria-selected on active one', () => {
    render(<Tabs items={items} value="ORG" onChange={() => {}} aria-label="主分類" />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(3)
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('fires onChange when clicking another tab', async () => {
    const onChange = vi.fn()
    render(<Tabs items={items} value="ORG" onChange={onChange} aria-label="主分類" />)
    await userEvent.click(screen.getByRole('tab', { name: '捐款專案' }))
    expect(onChange).toHaveBeenCalledWith('CAMPAIGN')
  })

  it('supports keyboard ← → navigation (AC-005 a11y)', async () => {
    const onChange = vi.fn()
    render(<Tabs items={items} value="ORG" onChange={onChange} aria-label="主分類" />)
    const active = screen.getByRole('tab', { selected: true })
    active.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith('CAMPAIGN')
  })

  it('wraps around with ←  from first item', async () => {
    const onChange = vi.fn()
    render(<Tabs items={items} value="ORG" onChange={onChange} aria-label="主分類" />)
    screen.getByRole('tab', { selected: true }).focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(onChange).toHaveBeenLastCalledWith('MERCHANDISE')
  })

  it('skips disabled tabs in keyboard navigation', async () => {
    const onChange = vi.fn()
    const withDisabled = [
      { value: 'ORG', label: 'A' },
      { value: 'CAMPAIGN', label: 'B', disabled: true },
      { value: 'MERCHANDISE', label: 'C' },
    ] as const
    render(<Tabs items={withDisabled} value="ORG" onChange={onChange} aria-label="X" />)
    screen.getByRole('tab', { selected: true }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(onChange).toHaveBeenLastCalledWith('MERCHANDISE')
  })

  it('moves DOM focus to the next tab on ArrowRight (roving-tabindex)', async () => {
    const onChange = vi.fn()
    render(<Tabs items={items} value="ORG" onChange={onChange} aria-label="主分類" />)
    const tabs = screen.getAllByRole('tab')
    tabs[0]!.focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(tabs[1])
  })

  it('jumps to first enabled tab on Home key (WAI-ARIA APG)', async () => {
    const onChange = vi.fn()
    render(<Tabs items={items} value="CAMPAIGN" onChange={onChange} aria-label="主分類" />)
    screen.getByRole('tab', { selected: true }).focus()
    await userEvent.keyboard('{Home}')
    expect(onChange).toHaveBeenLastCalledWith('ORG')
  })

  it('jumps to last enabled tab on End key (WAI-ARIA APG)', async () => {
    const onChange = vi.fn()
    render(<Tabs items={items} value="CAMPAIGN" onChange={onChange} aria-label="主分類" />)
    screen.getByRole('tab', { selected: true }).focus()
    await userEvent.keyboard('{End}')
    expect(onChange).toHaveBeenLastCalledWith('MERCHANDISE')
  })
})
