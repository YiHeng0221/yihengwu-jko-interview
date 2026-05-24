import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StickyHeaderStack } from './StickyHeaderStack'

describe('StickyHeaderStack', () => {
  it('renders children in order', () => {
    render(
      <StickyHeaderStack>
        <div data-testid="a">A</div>
        <div data-testid="b">B</div>
        <div data-testid="c">C</div>
      </StickyHeaderStack>,
    )
    const a = screen.getByTestId('a')
    const b = screen.getByTestId('b')
    const c = screen.getByTestId('c')
    expect(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(b.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('applies sticky + top-0 layout', () => {
    const { container } = render(
      <StickyHeaderStack>
        <div>X</div>
      </StickyHeaderStack>,
    )
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('sticky')
    expect(root.className).toContain('top-0')
  })

  it('merges custom className', () => {
    const { container } = render(
      <StickyHeaderStack className="custom">
        <div>X</div>
      </StickyHeaderStack>,
    )
    expect((container.firstChild as HTMLElement).className).toContain('custom')
  })
})
