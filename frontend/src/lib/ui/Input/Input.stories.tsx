import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './Input'

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  args: { 'aria-label': '搜尋', placeholder: '搜尋公益項目' },
  argTypes: {
    inputSize: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Plain: Story = {}

export const WithSearchIcon: Story = {
  args: { leadingIcon: <SearchIcon /> },
}

export const WithClearButton: Story = {
  args: {
    defaultValue: '台灣',
    leadingIcon: <SearchIcon />,
    trailingSlot: (
      <button type="button" aria-label="清除" className="text-text-secondary">
        ✕
      </button>
    ),
  },
}

export const Invalid: Story = { args: { invalid: true, defaultValue: 'invalid value' } }
export const Disabled: Story = { args: { disabled: true, defaultValue: '已停用' } }
