// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react';
import { Toast, ToastMessage } from './Toast';
import { ToastProvider, useToast } from './ToastContext';
import React, { useEffect } from 'react';

// Mock timer functions
vi.useFakeTimers();

afterEach(() => {
    cleanup();
    vi.clearAllTimers();
});

describe('Toast Component', () => {
    const mockOnClose = vi.fn();
    const defaultToast: ToastMessage = {
        id: 'test-1',
        message: 'Test Message',
        type: 'info',
        duration: 1000,
    };

    it('renders message and icon correctly', () => {
        render(<Toast toast={defaultToast} onClose={mockOnClose} />);

        expect(screen.getByText('Test Message')).toBeTruthy();
        expect(screen.getByText('ℹ')).toBeTruthy(); // Info icon
    });

    it('renders success icon', () => {
        const successToast: ToastMessage = { ...defaultToast, type: 'success' };
        render(<Toast toast={successToast} onClose={mockOnClose} />);

        expect(screen.getByText('✅')).toBeTruthy();
    });

    it('renders error icon', () => {
        const errorToast: ToastMessage = { ...defaultToast, type: 'error' };
        render(<Toast toast={errorToast} onClose={mockOnClose} />);

        expect(screen.getByText('⚠')).toBeTruthy();
    });

    it('calls onClose after duration + animation delay', () => {
        render(<Toast toast={defaultToast} onClose={mockOnClose} />);

        // Should not be called immediately
        expect(mockOnClose).not.toHaveBeenCalled();

        // Advance by duration (1000ms)
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        // Still waiting for animation (300ms)
        expect(mockOnClose).not.toHaveBeenCalled();

        // Advance by animation delay
        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(mockOnClose).toHaveBeenCalledWith('test-1');
    });
});

describe('ToastContext', () => {
    const TestComponent = () => {
        const { showToast } = useToast();
        return (
            <button onClick={() => showToast('Toast from Context', 'success', 2000)}>
                Show Toast
            </button>
        );
    };

    it('shows toast when requested', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        const button = screen.getByText('Show Toast');
        fireEvent.click(button);

        expect(screen.getByText('Toast from Context')).toBeTruthy();
        expect(screen.getByText('✅')).toBeTruthy();
    });

    it('removes toast automatically', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        fireEvent.click(screen.getByText('Show Toast'));
        expect(screen.getByText('Toast from Context')).toBeTruthy();

        // Duration (2000) + Animation (300)
        act(() => {
            vi.advanceTimersByTime(2300);
        });

        // Toast should be gone (or at least onClose called internally which removes it from state)
        // Since we are testing integration, we check if it's removed from DOM
        // Note: queryByText returns null if not found
        expect(screen.queryByText('Toast from Context')).toBeNull();
    });
});
