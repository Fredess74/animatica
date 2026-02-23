/**
 * ScriptConsole — Modal for JSON scene script input and AI prompt generation.
 * Textarea for JSON, Validate/Build/Copy-Prompt buttons, error display.
 *
 * @module @animatica/editor/modals/ScriptConsole
 */
import React, { useState, useCallback } from 'react';

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

    const handleValidate = useCallback(() => {
        try {
            JSON.parse(script);
            setErrors([]);
            setStatus('valid');
        } catch (e) {
            setErrors([(e as Error).message]);
            setStatus('error');
        }
    }, [script]);

    const handleBuildScene = useCallback(() => {
        try {
            JSON.parse(script); // Validate JSON format
            // In production: const parsed = JSON.parse(script); importScript(parsed) via engine
            setStatus('valid');
            setErrors([]);
            onClose();
        } catch (e) {
            setErrors(['Invalid JSON: ' + (e as Error).message]);
            setStatus('error');
        }
    }, [script, onClose]);

    const handleCopyPrompt = useCallback(() => {
        // In production: getAiPrompt('cinematic') from engine
        const prompt = `Generate a JSON scene for Animatica with actors, environment, and timeline.`;
        navigator.clipboard.writeText(prompt);
    }, []);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal script-console-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">📜 Script Console</h2>
                    <button className="modal__close" onClick={onClose}>✕</button>
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
                        spellCheck={false}
                        placeholder="Paste your JSON scene script here..."
                    />

                    {errors.length > 0 && (
                        <div className="script-console__errors">
                            {errors.map((err, i) => (
                                <p key={i} className="script-console__error">⚠ {err}</p>
                            ))}
                        </div>
                    )}

                    {status === 'valid' && (
                        <p className="script-console__success">✅ Valid JSON</p>
                    )}
                </div>

                <div className="modal__footer">
                    <button className="editor-btn editor-btn--ghost" onClick={handleCopyPrompt}>
                        📋 Copy AI Prompt
                    </button>
                    <button className="editor-btn editor-btn--ghost" onClick={handleValidate}>
                        ✓ Validate
                    </button>
                    <button className="editor-btn editor-btn--primary" onClick={handleBuildScene}>
                        🏗️ Build Scene
                    </button>
                </div>
            </div>
        </div>
    );
};
