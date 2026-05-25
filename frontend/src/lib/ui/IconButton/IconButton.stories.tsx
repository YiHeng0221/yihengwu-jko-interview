import type { Meta, StoryObj } from '@storybook/react'
import { IconButton } from './IconButton'

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />
  </svg>
)

const meta: Meta<typeof IconButton> = {
  title: 'UI/IconButton',
  component: IconButton,
  args: { 'aria-label': '加入收藏', children: <HeartIcon /> },
  argTypes: {
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Disabled: Story = { args: { disabled: true } }

export const OnBrandBackground: Story = {
  decorators: [
    (Story) => (
      <div style={{ background: 'var(--color-brand)', padding: 16, display: 'inline-block' }}>
        <Story />
      </div>
    ),
  ],
}
