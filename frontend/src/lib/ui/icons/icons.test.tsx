import { render } from '@testing-library/react'
import { SearchIcon } from './SearchIcon'
import { CloseIcon } from './CloseIcon'
import { ChevronDownIcon } from './ChevronDownIcon'
import { TagIcon } from './TagIcon'

const icons = [
  { name: 'SearchIcon', Component: SearchIcon, defaultSize: 16 },
  { name: 'CloseIcon', Component: CloseIcon, defaultSize: 16 },
  { name: 'ChevronDownIcon', Component: ChevronDownIcon, defaultSize: 14 },
  { name: 'TagIcon', Component: TagIcon, defaultSize: 12 },
] as const

for (const { name, Component, defaultSize } of icons) {
  describe(name, () => {
    it('renders an svg with aria-hidden="true"', () => {
      const { container } = render(<Component />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeNull()
      expect(svg?.getAttribute('aria-hidden')).toBe('true')
    })

    it('reflects size prop in width and height attributes', () => {
      const { container } = render(<Component size={32} />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('width')).toBe('32')
      expect(svg?.getAttribute('height')).toBe('32')
    })

    it('uses default size when size prop is omitted', () => {
      const { container } = render(<Component />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('width')).toBe(String(defaultSize))
      expect(svg?.getAttribute('height')).toBe(String(defaultSize))
    })

    it('passes className to the svg element', () => {
      const { container } = render(<Component className="text-red-500" />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('class')).toContain('text-red-500')
    })
  })
}
