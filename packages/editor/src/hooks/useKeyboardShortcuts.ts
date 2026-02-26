import { useEffect, useRef } from 'react';

export interface ShortcutHandlers {
  onPlayPause?: () => void;
  onSave?: () => void;
  onUndo?: () => void;
  onDelete?: () => void;
  onEscape?: () => void;
}

export const useKeyboardShortcuts = (handlers: ShortcutHandlers) => {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      const currentHandlers = handlersRef.current;

      // Handle Escape (works inside inputs)
      if (event.key === 'Escape') {
        currentHandlers.onEscape?.();
        return;
      }

      // Ctrl+S (Save) - allow even in inputs
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        currentHandlers.onSave?.();
        return;
      }

      // Ctrl+Z (Undo) - allow even in inputs (though browser might handle it, we want our own)
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        // If in input, let browser handle text undo unless we strictly want scene undo
        if (!isInput) {
          event.preventDefault();
          currentHandlers.onUndo?.();
        }
        return;
      }

      // If in input, ignore other shortcuts
      if (isInput) return;

      switch (event.key) {
        case ' ': // Space
        case 'Spacebar':
          event.preventDefault(); // Prevent scrolling
          currentHandlers.onPlayPause?.();
          break;
        case 'Delete':
        case 'Backspace':
          currentHandlers.onDelete?.();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};
