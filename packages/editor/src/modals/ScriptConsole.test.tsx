// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScriptConsole } from './ScriptConsole';
import { vi, describe, it, expect } from 'vitest';
import React from 'react';

// Mock dependencies
vi.mock('@Animatica/engine', () => ({
    validateScript: vi.fn((script) => {
        if (script.includes('error')) return { success: false, errors: ['Invalid script'] };
        return { success: true };
    }),
    tryImportScript: vi.fn(() => ({ ok: true, data: { actors: [], environment: {}, timeline: {} } })),
    getAiPrompt: vi.fn(() => 'Mock Prompt'),
    useSceneStore: {
        getState: () => ({
            actors: [],
            removeActor: vi.fn(),
            addActor: vi.fn(),
            setEnvironment: vi.fn(),
            setTimeline: vi.fn(),
        }),
    },
}));

vi.mock('../components/ToastContext', () => ({
    useToast: () => ({ showToast: vi.fn() }),
}));

describe('ScriptConsole', () => {
    it('renders and allows typing', () => {
        render(<ScriptConsole onClose={() => {}} />);
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: 'New Script' } });
        expect(textarea.value).toBe('New Script');
    });

    it('clears script on Clear button click', () => {
        render(<ScriptConsole onClose={() => {}} />);
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: 'Some script' } });

        // Find button by text content
        const clearBtn = screen.getByText(/Clear/i);
        fireEvent.click(clearBtn);

        expect(textarea.value).toBe('');
    });

    it('shows validation errors', async () => {
        render(<ScriptConsole onClose={() => {}} />);
        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, { target: { value: 'error script' } });

        const validateBtn = screen.getByText(/Validate/i);
        fireEvent.click(validateBtn);

        await waitFor(() => {
            expect(screen.getByText(/Invalid script/i)).toBeTruthy();
        });
    });
});
