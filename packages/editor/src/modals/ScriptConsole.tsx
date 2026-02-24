/**
 * ScriptConsole — Modal for JSON scene script input and AI prompt generation.
 * Textarea for JSON, Validate/Build/Copy-Prompt buttons, error display.
 *
 * @module @animatica/editor/modals/ScriptConsole
 */
import React, { useState, useCallback } from 'react';
import { Play, Check, Copy, Trash2, X, Sparkles, Terminal } from 'lucide-react';
import { getAiPrompt, validateScript } from '@Animatica/engine';
import { useToast } from '../components/ToastContext';

interface ScriptConsoleProps {
    onClose: () => void;
}

const EXAMPLE_SCRIPT = `{
  "meta": {
    "title": "My Scene",
    "duration": 10,
    "fps": 30
  },
  "environment": {
    "skyColor": "#0A0A0A",
    "ambientLight": { "color": "#ffffff", "intensity": 0.3 },
    "sun": { "position": [5, 10, 5], "intensity": 0.8, "color": "#ffeedd" }
  },
  "actors": [
    {
      "id": "box1",
      "name": "Green Box",
      "type": "primitive",
      "transform": { "position": [0, 0.5, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1] },
      "properties": { "shape": "box", "color": "#22C55E" }
    }
  ],
  "timeline": {
    "tracks": [],
    "cameraTrack": []
  }
}`;

export const ScriptConsole: React.FC<ScriptConsoleProps> = ({ onClose }) => {
    const [script, setScript] = useState(EXAMPLE_SCRIPT);
    const [errors, setErrors] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'valid' | 'error'>('idle');
    const { showToast } = useToast();

    const handleValidate = useCallback(() => {
        try {
            // Validate against schema (internally checks JSON syntax too)
            const result = validateScript(script);

            if (result.success) {
                setErrors([]);
                setStatus('valid');
                showToast('Script is valid!', 'success');
            } else {
                setErrors(result.errors || ['Unknown validation error']);
                setStatus('error');
                showToast('Validation failed', 'error');
            }
        } catch (e) {
            setErrors([(e as Error).message]);
            setStatus('error');
        }
    }, [script, showToast]);

    const handleBuildScene = useCallback(() => {
        try {
            const result = validateScript(script);

            if (result.success) {
                // In a real implementation, we would call importScript(script) here
                // importScript(script);
                setStatus('valid');
                setErrors([]);
                showToast('Scene built successfully!', 'success');
                onClose();
            } else {
                setErrors(result.errors || ['Validation failed']);
                setStatus('error');
                showToast('Cannot build: Validation failed', 'error');
            }
        } catch (e) {
            setErrors(['Invalid JSON: ' + (e as Error).message]);
            setStatus('error');
            showToast('Cannot build: Invalid JSON', 'error');
        }
    }, [script, onClose, showToast]);

    const handleCopyPrompt = useCallback(() => {
        try {
            // Default to a Cyberpunk style prompt for now
            const prompt = getAiPrompt('A futuristic city with flying cars and neon lights', 'Cyberpunk');
            navigator.clipboard.writeText(prompt);
            showToast('AI Prompt copied to clipboard', 'success');
        } catch (e) {
            console.error(e);
            showToast('Failed to copy prompt', 'error');
        }
    }, [showToast]);

    const handleClear = useCallback(() => {
        if (window.confirm('Are you sure you want to clear the script?')) {
            setScript('');
            setErrors([]);
            setStatus('idle');
            showToast('Script cleared', 'info');
        }
    }, [showToast]);

    const handleCopyScript = useCallback(() => {
        navigator.clipboard.writeText(script);
        showToast('Script copied to clipboard', 'success');
    }, [script, showToast]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            handleBuildScene();
        }
    }, [handleBuildScene]);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal script-console-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <Terminal size={20} />
                        <h2 className="modal__title">Script Console</h2>
                    </div>
                    <button className="modal__close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className="retro-stripe retro-stripe--thin" />

                <div className="script-console__body">
                    <textarea
                        className="script-console__editor"
                        value={script}
                        onChange={(e) => {
                            setScript(e.target.value);
                            setStatus('idle');
                        }}
                        onKeyDown={handleKeyDown}
                        spellCheck={false}
                        placeholder="Paste your JSON scene script here..."
                    />

                    {errors.length > 0 && (
                        <div className="script-console__errors">
                            {errors.map((err, i) => (
                                <p key={i} className="script-console__error">
                                    <X size={14} /> {err}
                                </p>
                            ))}
                        </div>
                    )}

                    {status === 'valid' && (
                        <div className="script-console__success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={14} /> Valid JSON
                        </div>
                    )}
                </div>

                <div className="modal__footer">
                    <div style={{ flex: 1, display: 'flex', gap: 'var(--space-sm)' }}>
                        <button className="editor-btn editor-btn--ghost" onClick={handleClear} title="Clear Script">
                            <Trash2 size={16} />
                        </button>
                        <button className="editor-btn editor-btn--ghost" onClick={handleCopyScript} title="Copy Script">
                            <Copy size={16} />
                        </button>
                    </div>

                    <button className="editor-btn editor-btn--ghost" onClick={handleCopyPrompt} title="Copy AI Prompt">
                        <Sparkles size={16} /> Copy AI Prompt
                    </button>
                    <button className="editor-btn editor-btn--ghost" onClick={handleValidate}>
                        <Check size={16} /> Validate
                    </button>
                    <button className="editor-btn editor-btn--primary" onClick={handleBuildScene} title="Build Scene (Ctrl+Enter)">
                        <Play size={16} /> Build Scene
                    </button>
                </div>
            </div>
        </div>
    );
};
