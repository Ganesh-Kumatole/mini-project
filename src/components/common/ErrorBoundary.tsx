import { Component, ReactNode, ErrorInfo } from 'react';

interface Props { children: ReactNode; }
interface State { error: Error | null; info: string; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: '' };

  static getDerivedStateFromError(error: Error): State {
    return { error, info: '' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
    this.setState({ info: info.componentStack ?? '' });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-red-200 dark:border-red-800 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="material-icons text-red-500 text-3xl">error_outline</span>
            </div>
            <h1 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6">
              {this.state.error.message || 'An unexpected error occurred. Try reloading the page.'}
            </p>
            <details className="text-left mb-6">
              <summary className="text-xs text-text-secondary-light dark:text-text-secondary-dark cursor-pointer hover:text-indigo-500 transition-colors">
                Show technical details
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg p-3 overflow-auto max-h-32 text-red-600 dark:text-red-400">
                {this.state.info}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <span className="material-icons text-base">refresh</span>
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
