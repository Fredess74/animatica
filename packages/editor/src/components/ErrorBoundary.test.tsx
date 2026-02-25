// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

// Mock engine error handler
vi.mock('@Animatica/engine', () => ({
    handleError: vi.fn(),
    AppError: class AppError extends Error { context = {}; },
}));

const ThrowError = ({ message }: { message: string }) => {
    throw new Error(message);
};

describe('ErrorBoundary', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('should render children when no error occurs', () => {
        render(
            <ErrorBoundary>
                <div>Safe Content</div>
            </ErrorBoundary>
        );
        expect(screen.getByText('Safe Content')).toBeTruthy();
    });

    it('should render fallback UI when an error occurs', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <ErrorBoundary>
                <ThrowError message="Test Failure" />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeTruthy();
        expect(screen.getByText('Test Failure')).toBeTruthy();
        expect(screen.getByText('Retry')).toBeTruthy();

        consoleSpy.mockRestore();
    });

    it('should render custom fallback if provided', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <ErrorBoundary fallback={<div>Custom Error Message</div>}>
                <ThrowError message="Boom" />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom Error Message')).toBeTruthy();
        expect(screen.queryByText('Something went wrong')).toBeNull();

        consoleSpy.mockRestore();
    });

    it('should reset error state when Retry is clicked', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        let shouldThrow = true;
        const FlakyComponent = () => {
            if (shouldThrow) {
                throw new Error('Transient Error');
            }
            return <div>Recovered Content</div>;
        };

        render(
            <ErrorBoundary>
                <FlakyComponent />
            </ErrorBoundary>
        );

        // Verify error state
        expect(screen.getByText('Transient Error')).toBeTruthy();
        expect(screen.getByText('Retry')).toBeTruthy();

        // Change condition so it doesn't throw next time
        shouldThrow = false;

        // Click retry
        fireEvent.click(screen.getByText('Retry'));

        // Wait for recovery
        expect(await screen.findByText('Recovered Content')).toBeTruthy();

        consoleSpy.mockRestore();
    });
});
