import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Dialog } from './Dialog'

type ArgShape = { title: string }

const meta: Meta<ArgShape> = {
  title: 'UI/Dialog',
  args: { title: '選擇類別' },
}

export default meta

type Story = StoryObj<typeof meta>

function Demo({ title }: { title: string }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const categories = ['動物保護', '兒少福利', '長者照顧', '環境永續', '醫療援助', '教育推廣']

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-button bg-brand px-4 py-2 text-text-on-brand"
      >
        開啟
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title}>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActive(c)}
              aria-pressed={active === c}
              className={
                active === c
                  ? 'rounded-chip border border-brand bg-brand px-3 py-1 text-sm text-text-on-brand'
                  : 'rounded-chip border border-border bg-surface px-3 py-1 text-sm text-text-primary'
              }
            >
              {c}
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-button bg-brand px-4 py-2 text-text-on-brand"
          >
            套用
          </button>
        </div>
      </Dialog>
    </div>
  )
}

export const CategoryDialog: Story = {
  render: (args) => <Demo title={args.title} />,
}
