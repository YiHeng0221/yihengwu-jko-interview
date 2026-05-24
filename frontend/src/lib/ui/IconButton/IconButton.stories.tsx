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
    variant: { control: 'inline-radio', options: ['primary', 'ghost', 'on-brand'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Ghost: Story = { args: { variant: 'ghost' } }
export const Primary: Story = { args: { variant: 'primary' } }
export const OnBrand: Story = {
  args: { variant: 'on-brand' },
  decorators: [
    (Story) => (
      <div style={{ background: '#e01e3c', padding: 16, display: 'inline-block' }}>
        <Story />
      </div>
    ),
  ],
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconButton {...args} aria-label="收藏 sm" size="sm"><HeartIcon /></IconButton>
      <IconButton {...args} aria-label="收藏 md" size="md"><HeartIcon /></IconButton>
      <IconButton {...args} aria-label="收藏 lg" size="lg"><HeartIcon /></IconButton>
    </div>
  ),
}
