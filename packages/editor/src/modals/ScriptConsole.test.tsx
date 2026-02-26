// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ScriptConsole } from './ScriptConsole';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as engine from '@Animatica/engine';

// Mock dependencies
vi.mock('../components/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

vi.mock('@Animatica/engine', () => ({
  getAiPrompt: vi.fn(),
  validateScript: vi.fn(),
  tryImportScript: vi.fn(),
  useSceneStore: Object.assign(vi.fn(), { getState: vi.fn() }),
}));

describe('ScriptConsole', () => {
  const onClose = vi.fn();
  const mockShowToast = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
    // Setup useToast mock
    const useToastMock = await import('../components/ToastContext');
    // @ts-expect-error - overriding read-only export for test
    useToastMock.useToast = () => ({ showToast: mockShowToast });
  });

  afterEach(() => {
    cleanup();
    vi.resetModules();
  });

  it('renders correctly', () => {
    render(<ScriptConsole onClose={onClose} />);
    expect(screen.getByText('📜 Script Console')).toBeTruthy();
    expect(screen.getByPlaceholderText('Paste your JSON scene script here...')).toBeTruthy();
  });

  it('calls onClose when close button is clicked', () => {
    render(<ScriptConsole onClose={onClose} />);
    fireEvent.click(screen.getByText('✕'));
    expect(onClose).toHaveBeenCalled();
  });

  it('copies AI prompt to clipboard', async () => {
    const mockGetAiPrompt = vi.spyOn(engine, 'getAiPrompt').mockReturnValue('Mock Prompt');
    const mockWriteText = vi.fn();
    Object.assign(navigator, { clipboard: { writeText: mockWriteText } });

    render(<ScriptConsole onClose={onClose} />);
    fireEvent.click(screen.getByText('📋 Copy AI Prompt'));

    expect(mockGetAiPrompt).toHaveBeenCalled();
    expect(mockWriteText).toHaveBeenCalledWith('Mock Prompt');
  });

  it('validates script successfully', () => {
    vi.spyOn(engine, 'validateScript').mockReturnValue({ success: true, errors: [] });

    render(<ScriptConsole onClose={onClose} />);
    fireEvent.click(screen.getByText('✓ Validate'));

    expect(engine.validateScript).toHaveBeenCalled();
    expect(screen.getByText('✅ Valid JSON')).toBeTruthy();
  });

  it('shows validation errors', () => {
    vi.spyOn(engine, 'validateScript').mockReturnValue({ success: false, errors: ['Invalid syntax'] });

    render(<ScriptConsole onClose={onClose} />);
    fireEvent.click(screen.getByText('✓ Validate'));

    expect(screen.getByText('⚠ Invalid syntax')).toBeTruthy();
  });

  it('builds scene successfully', () => {
    const mockSetEnvironment = vi.fn();
    const mockSetTimeline = vi.fn();
    const mockAddActor = vi.fn();
    const mockRemoveActor = vi.fn();

    // Mock store state
    vi.spyOn(engine.useSceneStore, 'getState').mockReturnValue({
      actors: [{ id: 'old1' }],
      removeActor: mockRemoveActor,
      setEnvironment: mockSetEnvironment,
      setTimeline: mockSetTimeline,
      addActor: mockAddActor,
    } as any);

    vi.spyOn(engine, 'tryImportScript').mockReturnValue({
      ok: true,
      data: {
        environment: {},
        timeline: {},
        actors: [{ id: 'new1' }],
      } as any,
    });

    render(<ScriptConsole onClose={onClose} />);
    fireEvent.click(screen.getByText('🏗️ Build Scene'));

    expect(mockRemoveActor).toHaveBeenCalledWith('old1');
    expect(mockSetEnvironment).toHaveBeenCalled();
    expect(mockSetTimeline).toHaveBeenCalled();
    expect(mockAddActor).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('handles build scene failure', () => {
    vi.spyOn(engine, 'tryImportScript').mockReturnValue({
      ok: false,
      errors: ['Build failed'],
    } as any);

    render(<ScriptConsole onClose={onClose} />);
    fireEvent.click(screen.getByText('🏗️ Build Scene'));

    expect(screen.getByText('⚠ Build failed')).toBeTruthy();
    expect(onClose).not.toHaveBeenCalled();
  });
});
