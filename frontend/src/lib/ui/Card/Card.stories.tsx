import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'

const Logo = () => (
  <div className="size-12 rounded-full bg-brand-soft text-brand flex items-center justify-center font-bold">
    ❤
  </div>
)

const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

// Card 是 polymorphic（discriminated union on `as`），用 article 變體當 stories 預設。
// 其他變體（button/anchor）用 render-only story 展示，不透過 args 傳遞，避免 union 推導爆炸。
type ArticleArgs = {
  label: string
  description?: string
  leading?: React.ReactNode
  trailing?: React.ReactNode
  interactive?: boolean
}

const meta = {
  title: 'UI/Card',
  component: Card,
  args: {
    label: '台灣動物保護協會',
    description: '幫助流浪動物找到一個溫暖的家',
    leading: <Logo />,
    trailing: <Chevron />,
  } satisfies ArticleArgs,
} satisfies Meta<ArticleArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TitleOnly: Story = {
  args: { description: undefined, trailing: undefined },
}

export const InteractiveButton: Story = {
  render: (args) => (
    <Card
      as="button"
      interactive
      label={args.label}
      description={args.description}
      leading={args.leading}
      trailing={args.trailing}
    />
  ),
}

export const InteractiveAnchor: Story = {
  render: (args) => (
    <Card
      as="a"
      href="https://example.com"
      interactive
      label={args.label}
      description={args.description}
      leading={args.leading}
      trailing={args.trailing}
    />
  ),
}

export const LongLabel: Story = {
  args: {
    label: '這是一個非常非常非常非常非常非常非常非常長的標題會被 truncate',
    description: '同樣的，描述也會被 truncate 處理避免破壞 list layout',
  },
}
