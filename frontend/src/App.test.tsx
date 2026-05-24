import { render } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders without error', () => {
    const { container } = render(<App />)
    // App currently returns null; empty root is expected behaviour
    expect(container).toBeInTheDocument()
  })
})
