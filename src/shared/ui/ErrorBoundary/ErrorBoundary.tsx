import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  /** Shown instead of the default panel — used to keep the shell around a page-level crash. */
  fallback?: (reset: () => void, error: Error) => ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time crashes that would otherwise white-screen the app.
 *
 * The default fallback deliberately uses no hooks and no translations: this boundary also
 * wraps the provider tree, so it has to be able to render when the very contexts those
 * helpers depend on are what failed.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    // No telemetry sink yet; the console is the only place this can go.
    console.error('Unhandled render error', error, info.componentStack);
  }

  reset = (): void => this.setState({ error: null });

  override render(): ReactNode {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.reset, error);

    return (
      <div className={`empty ${styles.fallback}`}>
        <h3>Something broke</h3>
        <p>{error.message || 'An unexpected error occurred.'}</p>
        <button
          className={`btn btn--soft btn--sm ${styles.reload}`}
          onClick={() => window.location.reload()}
        >
          Reload
        </button>
      </div>
    );
  }
}
