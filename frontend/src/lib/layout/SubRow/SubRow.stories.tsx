import type { Meta, StoryObj } from '@storybook/react'
import { SubRow } from './SubRow'

const meta: Meta<typeof SubRow> = {
  title: 'Layout/SubRow',
  component: SubRow,
  args: {
    leading: (
      <button
        type="button"
        className="flex items-center gap-1 rounded-button px-2 py-1 text-sm text-text-primary hover:bg-surface-muted"
      >
        全部
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    ),
    trailing: (
      <button
        type="button"
        aria-label="搜尋"
        className="rounded-button p-2 text-text-secondary hover:bg-surface-muted"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
    ),
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
