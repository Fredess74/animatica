// @vitest-environment jsdom
// @ts-ignore
import React from 'react';
import { render, screen, act, cleanup } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const TestComponent = () => {
    const { showToast } = useToast();
    return (
        <button onClick={() => showToast('Test Message', 'success', 3000)}>
            Show Toast
        </button>
    );
};

describe('ToastContext', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        cleanup();
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    it('shows toast when showToast is called', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        act(() => {
            screen.getByText('Show Toast').click();
        });

        expect(screen.getByText('Test Message')).toBeTruthy();
        expect(screen.getByText('✅')).toBeTruthy();
    });

    it('removes toast after duration', () => {
        render(
            <ToastProvider>
                <TestComponent />
            </ToastProvider>
        );

        act(() => {
            screen.getByText('Show Toast').click();
        });

        expect(screen.getByText('Test Message')).toBeTruthy();

        // Fast-forward time
        act(() => {
            vi.advanceTimersByTime(3000); // Duration
            vi.advanceTimersByTime(300); // Animation
        });

        expect(screen.queryByText('Test Message')).toBeNull();
    });
});
