import type { Meta, StoryObj } from '@storybook/react'
import { EndMarker } from './EndMarker'

const meta: Meta<typeof EndMarker> = {
  title: 'UI/EndMarker',
  component: EndMarker,
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomLabel: Story = { args: { label: '到底囉' } }
