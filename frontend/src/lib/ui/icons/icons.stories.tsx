import type { Meta, StoryObj } from '@storybook/react'
import { SearchIcon } from './SearchIcon'
import { CloseIcon } from './CloseIcon'
import { ChevronDownIcon } from './ChevronDownIcon'
import { TagIcon } from './TagIcon'

const meta: Meta = {
  title: 'icons/Gallery',
}
export default meta
type Story = StoryObj

export const All: Story = {
  render: () => (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <SearchIcon /> <code>SearchIcon</code>
      </div>
      <div className="flex items-center gap-3">
        <CloseIcon /> <code>CloseIcon</code>
      </div>
      <div className="flex items-center gap-3">
        <ChevronDownIcon /> <code>ChevronDownIcon</code>
      </div>
      <div className="flex items-center gap-3 text-brand">
        <TagIcon size={16} className="opacity-50" /> <code>TagIcon (filled, red, 50% opacity)</code>
      </div>
    </div>
  ),
}
