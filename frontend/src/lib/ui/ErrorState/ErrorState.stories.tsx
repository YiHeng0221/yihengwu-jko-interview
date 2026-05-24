import type { Meta, StoryObj } from '@storybook/react'
import { ErrorState } from './ErrorState'

const AlertIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12" y2="16" />
  </svg>
)

const meta: Meta<typeof ErrorState> = {
  title: 'UI/ErrorState',
  component: ErrorState,
  args: { icon: <AlertIcon /> },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const ServerError: Story = {
  args: {
    title: '伺服器忙碌中',
    description: '請稍後再試一次，我們正在處理',
    retryLabel: '重新載入',
  },
}

export const NoRetry: Story = {
  args: {
    retryLabel: null,
    title: '尚未支援',
    description: '此地區暫時無法瀏覽',
  },
}
