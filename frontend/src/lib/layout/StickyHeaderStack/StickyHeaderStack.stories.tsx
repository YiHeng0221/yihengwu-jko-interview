import type { Meta, StoryObj } from '@storybook/react'
import { StickyHeaderStack } from './StickyHeaderStack'

const meta: Meta<typeof StickyHeaderStack> = {
  title: 'Layout/StickyHeaderStack',
  component: StickyHeaderStack,
}

export default meta

type Story = StoryObj<typeof meta>

export const ThreeLayer: Story = {
  render: () => (
    <div className="h-[400px] w-96 overflow-auto border border-border">
      <StickyHeaderStack>
        <div className="flex h-topbar items-center justify-center bg-brand text-text-on-brand">
          TopBar (44px)
        </div>
        <div className="flex h-tabbar items-center justify-center border-b border-border bg-surface">
          TabBar (48px)
        </div>
        <div className="flex h-subrow items-center justify-center bg-surface-muted">
          SubRow (48px)
        </div>
      </StickyHeaderStack>
      <div className="p-3">
        {Array.from({ length: 30 }, (_, i) => `item-${i}`).map((id, i) => (
          <div key={id} className="my-2 rounded-card border border-border p-3">
            list item {i + 1}
          </div>
        ))}
      </div>
    </div>
  ),
}
