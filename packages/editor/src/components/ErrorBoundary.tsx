import { Component, ErrorInfo, ReactNode } from 'react';
import { handleError } from '@Animatica/engine';

interface Props {
  children: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    handleError(error, {
      component: this.props.componentName || 'ErrorBoundary',
      meta: { errorInfo }
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-fallback" style={{
            padding: 'var(--space-md)',
            border: '2px dashed var(--color-error)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--text-primary)',
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
          <h3 style={{ margin: '0 0 var(--space-sm) 0', color: 'var(--color-error)' }}>
            ⚠️ Something went wrong
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginBottom: 'var(--space-md)' }}>
            Error in <strong>{this.props.componentName || 'Component'}</strong>
          </p>
          <button
            onClick={this.handleRetry}
            style={{
                padding: 'var(--space-xs) var(--space-md)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'background 0.2s',
                fontFamily: 'var(--font-display)'
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
