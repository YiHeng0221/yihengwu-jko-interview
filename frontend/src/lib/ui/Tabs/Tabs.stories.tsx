import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Tabs } from './Tabs'

const items = [
  { value: 'ORG', label: '公益團體' },
  { value: 'CAMPAIGN', label: '捐款專案' },
  { value: 'MERCHANDISE', label: '義賣商品' },
] as const

type CharityTabValue = (typeof items)[number]['value']

type ArgShape = { initial: CharityTabValue }

const meta: Meta<ArgShape> = {
  title: 'UI/Tabs',
  argTypes: {
    initial: {
      control: 'inline-radio',
      options: ['ORG', 'CAMPAIGN', 'MERCHANDISE'],
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

function Demo({ initial }: { initial: CharityTabValue }) {
  const [value, setValue] = useState<CharityTabValue>(initial)
  return (
    <div className="w-96">
      <Tabs items={items} value={value} onChange={setValue} aria-label="主分類" />
      <div className="mt-4 text-sm text-text-secondary">
        現在選的：<code>{value}</code>
      </div>
    </div>
  )
}

export const Default: Story = {
  args: { initial: 'ORG' },
  render: ({ initial }) => <Demo initial={initial} />,
}
