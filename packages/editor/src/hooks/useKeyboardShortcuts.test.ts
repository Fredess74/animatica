// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { describe, it, expect, vi, afterEach } from 'vitest';

describe('useKeyboardShortcuts', () => {
  const handlers = {
    onPlayPause: vi.fn(),
    onSave: vi.fn(),
    onUndo: vi.fn(),
    onDelete: vi.fn(),
    onEscape: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('triggers onPlayPause when Space is pressed', () => {
    renderHook(() => useKeyboardShortcuts(handlers));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(handlers.onPlayPause).toHaveBeenCalled();
  });

  it('triggers onSave when Ctrl+S is pressed', () => {
    renderHook(() => useKeyboardShortcuts(handlers));
    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);
    expect(handlers.onSave).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('triggers onUndo when Ctrl+Z is pressed (not in input)', () => {
    renderHook(() => useKeyboardShortcuts(handlers));
    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
    vi.spyOn(event, 'preventDefault');
    window.dispatchEvent(event);
    expect(handlers.onUndo).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('does NOT trigger onUndo when Ctrl+Z is pressed inside input', () => {
    renderHook(() => useKeyboardShortcuts(handlers));
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });
    Object.defineProperty(event, 'target', { value: input });
    window.dispatchEvent(event);

    expect(handlers.onUndo).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('triggers onDelete when Delete is pressed', () => {
    renderHook(() => useKeyboardShortcuts(handlers));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
    expect(handlers.onDelete).toHaveBeenCalled();
  });

  it('triggers onEscape when Escape is pressed', () => {
    renderHook(() => useKeyboardShortcuts(handlers));
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(handlers.onEscape).toHaveBeenCalled();
  });

  it('triggers onEscape when Escape is pressed INSIDE input', () => {
    renderHook(() => useKeyboardShortcuts(handlers));
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Mock event target
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    Object.defineProperty(event, 'target', { value: input });
    window.dispatchEvent(event);

    expect(handlers.onEscape).toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('does not trigger shortcuts (except Ctrl+S and Escape) when inside input', () => {
    renderHook(() => useKeyboardShortcuts(handlers));
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    // Mock event target
    const event = new KeyboardEvent('keydown', { key: ' ' });
    Object.defineProperty(event, 'target', { value: input });
    window.dispatchEvent(event);

    expect(handlers.onPlayPause).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });
});
