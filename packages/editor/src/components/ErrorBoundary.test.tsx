// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';
import * as Engine from '@Animatica/engine';

// Mock the module
vi.mock('@Animatica/engine', () => ({
    handleError: vi.fn(),
}));

// Create a component that throws
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test Error');
    }
    return <div>Safe Content</div>;
};

describe('ErrorBoundary', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it('renders children when no error occurs', () => {
        render(
            <ErrorBoundary>
                <div>Safe Content</div>
            </ErrorBoundary>
        );
        expect(screen.getByText('Safe Content')).toBeTruthy();
    });

    it('renders fallback UI when an error occurs', () => {
        render(
            <ErrorBoundary componentName="TestComponent">
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        expect(screen.getByText(/Something went wrong/i)).toBeTruthy();
        expect(screen.getByText(/TestComponent/i)).toBeTruthy();
        expect(Engine.handleError).toHaveBeenCalled();
    });

    it('allows retrying', () => {
        render(
            <ErrorBoundary>
                <ThrowError shouldThrow={true} />
            </ErrorBoundary>
        );

        const retryButton = screen.getByText('Retry');
        expect(retryButton).toBeTruthy();

        fireEvent.click(retryButton);
    });
});
