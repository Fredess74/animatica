/**
 * ErrorBoundary Component
 * Catches JavaScript errors in its child component tree, logs those errors,
 * and displays a fallback UI instead of crashing the whole app.
 *
 * @module @animatica/editor/components/ErrorBoundary
 */
import React from 'react';
import { handleError } from '@Animatica/engine';

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    componentName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundaryInner extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        handleError(error, {
            component: this.props.componentName || 'UnknownComponent',
            reactErrorInfo: errorInfo
        });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    padding: 'var(--space-lg)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--color-error-muted)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '200px',
                    textAlign: 'center',
                    gap: 'var(--space-md)'
                }}>
                    <h3 style={{ color: 'var(--color-error)', fontFamily: 'var(--font-display)' }}>
                        Something went wrong
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', maxWidth: '80%' }}>
                        {this.state.error?.message || 'Unknown error occurred'}
                    </p>
                    <button
                        onClick={this.handleRetry}
                        style={{
                            padding: 'var(--space-sm) var(--space-md)',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-body)',
                            transition: 'var(--transition-fast)'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--text-primary)'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-default)'}
                    >
                        Retry
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

// Wrapper to allow usage of hooks (if needed in future) or just clean export
export const ErrorBoundary: React.FC<Props> = (props) => {
    return <ErrorBoundaryInner {...props} />;
};
