// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { ScriptConsole } from './ScriptConsole';
import * as ToastContext from '../components/ToastContext';
import * as Engine from '@Animatica/engine';

// Mock useToast
const mockShowToast = vi.fn();
vi.mock('../components/ToastContext', () => ({
    useToast: () => ({ showToast: mockShowToast }),
}));

// Mock @Animatica/engine
vi.mock('@Animatica/engine', () => ({
    validateScript: vi.fn(),
    getAiPrompt: vi.fn(),
}));

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('ScriptConsole', () => {
    const mockOnClose = vi.fn();
    const mockValidateScript = Engine.validateScript as unknown as ReturnType<typeof vi.fn>;
    const mockGetAiPrompt = Engine.getAiPrompt as unknown as ReturnType<typeof vi.fn>;

    // Mock clipboard
    const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    it('renders correctly with default script', () => {
        render(<ScriptConsole onClose={mockOnClose} />);

        expect(screen.getByRole('textbox')).toBeTruthy(); // Textarea
        expect(screen.getByText('📋 Copy AI Prompt')).toBeTruthy();
        expect(screen.getByText('✓ Validate')).toBeTruthy();
        expect(screen.getByText('🏗️ Build Scene')).toBeTruthy();
    });

    it('updates script content', () => {
        render(<ScriptConsole onClose={mockOnClose} />);

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        fireEvent.change(textarea, { target: { value: '{"test": true}' } });

        expect(textarea.value).toBe('{"test": true}');
    });

    it('validates script successfully', () => {
        mockValidateScript.mockReturnValue({ success: true });

        render(<ScriptConsole onClose={mockOnClose} />);

        fireEvent.click(screen.getByText('✓ Validate'));

        expect(mockValidateScript).toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith('Script is valid!', 'success');
        expect(screen.getByText('✅ Valid JSON')).toBeTruthy();
    });

    it('shows validation errors', () => {
        mockValidateScript.mockReturnValue({ success: false, errors: ['Missing field "actors"'] });

        render(<ScriptConsole onClose={mockOnClose} />);

        fireEvent.click(screen.getByText('✓ Validate'));

        expect(mockValidateScript).toHaveBeenCalled();
        expect(mockShowToast).toHaveBeenCalledWith('Validation failed', 'error');
        expect(screen.getByText('⚠ Missing field "actors"')).toBeTruthy();
    });

    it('builds scene successfully', () => {
        mockValidateScript.mockReturnValue({ success: true });

        render(<ScriptConsole onClose={mockOnClose} />);

        fireEvent.click(screen.getByText('🏗️ Build Scene'));

        // Since build logic is commented out in component or simple, we assume it proceeds
        // In real app, it calls importScript. Here we verify success path.
        expect(mockShowToast).toHaveBeenCalledWith('Scene built successfully!', 'success');
        expect(mockOnClose).toHaveBeenCalled();
    });

    it('builds scene failure (validation)', () => {
        mockValidateScript.mockReturnValue({ success: false, errors: ['Invalid JSON'] });

        render(<ScriptConsole onClose={mockOnClose} />);

        fireEvent.click(screen.getByText('🏗️ Build Scene'));

        expect(mockShowToast).toHaveBeenCalledWith('Cannot build: Validation failed', 'error');
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('handles JSON parse error gracefully', () => {
        mockValidateScript.mockImplementation(() => {
            throw new Error('Unexpected token');
        });

        render(<ScriptConsole onClose={mockOnClose} />);

        fireEvent.click(screen.getByText('✓ Validate'));

        expect(mockShowToast).not.toHaveBeenCalledWith('Script is valid!', 'success');
        // The component sets status error
        expect(screen.queryByText('✅ Valid JSON')).toBeNull();
    });

    it('copies AI prompt', async () => {
        mockGetAiPrompt.mockReturnValue('Generate a scene with...');

        render(<ScriptConsole onClose={mockOnClose} />);

        await act(async () => {
            fireEvent.click(screen.getByText('📋 Copy AI Prompt'));
        });

        expect(mockGetAiPrompt).toHaveBeenCalled();
        expect(mockClipboard.writeText).toHaveBeenCalledWith('Generate a scene with...');
        expect(mockShowToast).toHaveBeenCalledWith('AI Prompt copied to clipboard', 'success');
    });
});
