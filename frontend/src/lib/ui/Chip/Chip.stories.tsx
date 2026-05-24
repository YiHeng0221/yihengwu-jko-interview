import type { Meta, StoryObj } from '@storybook/react'
import { Chip } from './Chip'

const meta: Meta<typeof Chip> = {
  title: 'UI/Chip',
  component: Chip,
  args: { label: '動物保護' },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Active: Story = { args: { active: true } }

export const Disabled: Story = { args: { disabled: true } }
