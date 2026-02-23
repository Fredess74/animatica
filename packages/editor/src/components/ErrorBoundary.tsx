/**
 * React Error Boundary for the editor UI.
 * Catches errors in panels, modals, and other UI components.
 * Displays a fallback UI with a retry button.
 *
 * @module @animatica/editor/components/ErrorBoundary
 */
import React, { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    scope: string;
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

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error(`[ErrorBoundary] Error in ${this.props.scope}:`, error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    className="p-4 rounded border border-red-500 bg-red-900/20 text-red-200 flex flex-col gap-2"
                    role="alert"
                >
                    <div className="flex items-center gap-2 font-bold">
                        <span>⚠️</span>
                        <span>Something went wrong in {this.props.scope}</span>
                    </div>
                    <div className="text-xs opacity-80 break-all font-mono">
                        {this.state.error?.message}
                    </div>
                    <button
                        onClick={this.handleRetry}
                        className="self-start px-3 py-1 text-xs bg-red-700 hover:bg-red-600 text-white rounded transition-colors"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
