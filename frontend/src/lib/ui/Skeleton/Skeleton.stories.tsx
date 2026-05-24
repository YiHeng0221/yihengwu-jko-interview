import type { Meta, StoryObj } from '@storybook/react'
import { CardSkeleton, Skeleton } from './Skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  argTypes: {
    shape: { control: 'inline-radio', options: ['line', 'circle', 'block'] },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Line: Story = { args: { shape: 'line', className: 'w-48' } }
export const Circle: Story = { args: { shape: 'circle' } }
export const Block: Story = { args: { shape: 'block', className: 'w-full' } }

export const CardPlaceholderList: Story = {
  name: 'CardSkeleton × 5',
  render: () => (
    <div className="flex w-96 flex-col gap-3">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  ),
}
