import { Component, type ReactNode } from 'react'
import { ErrorState } from '../lib/ui/ErrorState/ErrorState'

interface StatusError extends Error { status: number }
function isStatusError(err: Error): err is StatusError {
  return 'status' in err && typeof (err as StatusError).status === 'number'
}
function getErrorStatus(err: Error): number | undefined {
  return isStatusError(err) ? err.status : undefined
}

function isRetriable(err: Error): boolean {
  return getErrorStatus(err) !== 401
}

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  private reset = () => {
    this.setState({ error: null })
  }

  override render(): ReactNode {
    const { error } = this.state

    if (error !== null) {
      if (isRetriable(error)) {
        return <ErrorState onRetry={this.reset} />
      }
      return <ErrorState retryLabel={null} description="您的工作階段已過期，請重新整理頁面。" />
    }

    return this.props.children
  }
}
