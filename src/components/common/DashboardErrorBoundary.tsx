import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Dashboard crashed]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-xl">
          <h2 className="text-lg font-bold text-red-800 mb-2">Dashboard failed to load</h2>
          <p className="text-sm text-red-700 mb-4">
            {this.state.error?.message ?? 'Unknown error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
