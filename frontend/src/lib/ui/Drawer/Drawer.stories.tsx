import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Drawer } from './Drawer'

type ArgShape = { title: string }

const meta: Meta<ArgShape> = {
  title: 'UI/Drawer',
  args: { title: '選擇類別' },
}

export default meta

type Story = StoryObj<typeof meta>

function Demo({ title }: { title: string }) {
  const [open, setOpen] = useState(false)
  const categories = ['動物保護', '兒少福利', '長者照顧', '環境永續', '醫療援助', '教育推廣']
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-button bg-brand px-4 py-2 text-text-on-brand"
      >
        開啟（手機底部 slide-up）
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title={title}>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className="rounded-button bg-surface-muted px-3 py-1 text-sm text-text-primary"
            >
              {c}
            </button>
          ))}
        </div>
      </Drawer>
    </div>
  )
}

export const CategoryDrawer: Story = {
  render: (args) => <Demo title={args.title} />,
}
