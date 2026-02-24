// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { ScriptConsole } from './ScriptConsole';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock engine functions
vi.mock('@Animatica/engine', () => ({
    getAiPrompt: vi.fn((desc, style) => `Prompt: ${desc} in ${style} style`),
    validateScript: vi.fn((script) => {
        if (script.includes('error')) {
            return { success: false, errors: ['Script error found'] };
        }
        return { success: true };
    }),
}));

// Mock useToast
const mockShowToast = vi.fn();
vi.mock('../components/ToastContext', () => ({
    useToast: () => ({
        showToast: mockShowToast,
    }),
}));

// Mock navigator.clipboard
Object.assign(navigator, {
    clipboard: {
        writeText: vi.fn(),
    },
});

describe('ScriptConsole', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        mockShowToast.mockClear();
        mockOnClose.mockClear();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly', () => {
        render(<ScriptConsole onClose={mockOnClose} />);
        expect(screen.getByText('📜 Script Console')).toBeTruthy();
        expect(screen.getByPlaceholderText('Paste your JSON scene script here...')).toBeTruthy();
    });

    it('validates script successfully', () => {
        render(<ScriptConsole onClose={mockOnClose} />);

        const validateBtn = screen.getByText('✓ Validate');
        fireEvent.click(validateBtn);

        expect(mockShowToast).toHaveBeenCalledWith('Script is valid!', 'success');
        expect(screen.getByText('✅ Valid JSON')).toBeTruthy();
    });

    it('shows validation errors', () => {
        render(<ScriptConsole onClose={mockOnClose} />);

        const textarea = screen.getByPlaceholderText('Paste your JSON scene script here...');
        fireEvent.change(textarea, { target: { value: '{"error": true}' } });

        const validateBtn = screen.getByText('✓ Validate');
        fireEvent.click(validateBtn);

        expect(mockShowToast).toHaveBeenCalledWith('Validation failed', 'error');
        expect(screen.getByText('⚠ Script error found')).toBeTruthy();
    });

    it('builds scene successfully', () => {
         render(<ScriptConsole onClose={mockOnClose} />);

         const buildBtn = screen.getByText('🏗️ Build Scene');
         fireEvent.click(buildBtn);

         expect(mockShowToast).toHaveBeenCalledWith('Scene built successfully!', 'success');
         expect(mockOnClose).toHaveBeenCalled();
    });

    it('copies AI prompt', async () => {
        render(<ScriptConsole onClose={mockOnClose} />);

        const copyBtn = screen.getByText('📋 Copy AI Prompt');
        fireEvent.click(copyBtn);

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('Prompt:'));
        expect(mockShowToast).toHaveBeenCalledWith('AI Prompt copied to clipboard', 'success');
    });
});
