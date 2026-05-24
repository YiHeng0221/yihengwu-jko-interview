import type { Meta, StoryObj } from '@storybook/react'
import { TopBar } from './TopBar'

const BackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const meta: Meta<typeof TopBar> = {
  title: 'Layout/TopBar',
  component: TopBar,
  args: { title: '所有捐款項目' },
}

export default meta

type Story = StoryObj<typeof meta>

export const TitleOnly: Story = {}

export const WithBackButton: Story = {
  args: {
    leading: (
      <button
        type="button"
        aria-label="返回"
        className="rounded-button p-2 text-text-on-brand hover:bg-brand-dark"
      >
        <BackIcon />
      </button>
    ),
  },
}
