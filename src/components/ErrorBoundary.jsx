import { Component } from 'react'

// Class component because hooks have no `componentDidCatch` equivalent.
// Wrap any lazy-loaded route so an exception inside it does not blank the
// whole tree.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    if (this.props.fallback) {
      return this.props.fallback({ error, reset: this.reset })
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-6">
        <div className="glass rounded-3xl p-8 md:p-10 max-w-md text-center">
          <p className="eyebrow">Something went wrong</p>
          <h1 className="font-display text-2xl md:text-3xl mt-3">
            This page hit an error
          </h1>
          <p className="text-sm text-muted mt-3">
            Try reloading. If it keeps happening, head back to the home page.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Reload page
            </button>
            <a href="/" className="btn-ghost">
              Go home
            </a>
          </div>
        </div>
      </div>
    )
  }
}
