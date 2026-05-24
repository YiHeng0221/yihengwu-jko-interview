import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from './EmptyState'

const SearchIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  args: {
    icon: <SearchIcon />,
    title: '找不到符合的項目',
    description: '試試其他關鍵字或調整篩選條件',
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const NoSearchResult: Story = {}

export const TitleOnly: Story = {
  args: { description: undefined, icon: undefined },
}

export const WithClearAction: Story = {
  args: {
    action: (
      <button
        type="button"
        className="rounded-button bg-brand px-4 py-2 text-text-on-brand"
      >
        清除搜尋
      </button>
    ),
  },
}
