// @vitest-environment jsdom
// @ts-ignore
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { Toast, ToastMessage } from './Toast';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Toast Component', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
    });

    const mockToast: ToastMessage = {
        id: '1',
        message: 'Test Message',
        type: 'success',
        duration: 3000,
    };

    const mockOnClose = vi.fn();

    beforeEach(() => {
        mockOnClose.mockClear();
    });

    it('renders the toast message', () => {
        render(<Toast toast={mockToast} onClose={mockOnClose} />);
        expect(screen.getByText('Test Message')).toBeTruthy();
        expect(screen.getByText('✅')).toBeTruthy();
    });

    it('renders error toast correctly', () => {
        const errorToast: ToastMessage = { ...mockToast, type: 'error' };
        render(<Toast toast={errorToast} onClose={mockOnClose} />);
        expect(screen.getByText('⚠')).toBeTruthy();
    });

    it('renders info toast correctly', () => {
        const infoToast: ToastMessage = { ...mockToast, type: 'info' };
        render(<Toast toast={infoToast} onClose={mockOnClose} />);
        expect(screen.getByText('ℹ')).toBeTruthy();
    });

    it('calls onClose after duration', () => {
        render(<Toast toast={mockToast} onClose={mockOnClose} />);

        // Fast-forward time
        act(() => {
            vi.advanceTimersByTime(3000); // Wait for initial timer
        });

        // Wait for animation timer (300ms)
        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(mockOnClose).toHaveBeenCalledWith('1');
    });

    it('uses custom duration', () => {
         const customToast: ToastMessage = { ...mockToast, duration: 5000 };
         render(<Toast toast={customToast} onClose={mockOnClose} />);

         act(() => {
             vi.advanceTimersByTime(3000);
         });
         expect(mockOnClose).not.toHaveBeenCalled();

         act(() => {
             vi.advanceTimersByTime(2000); // Reach 5000
             vi.advanceTimersByTime(300); // Animation
         });
         expect(mockOnClose).toHaveBeenCalledWith('1');
    });
});
