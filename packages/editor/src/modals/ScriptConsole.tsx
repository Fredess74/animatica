/**
 * ScriptConsole — Modal for JSON scene script input and AI prompt generation.
 * Textarea for JSON, Validate/Build/Copy-Prompt buttons, error display.
 *
 * @module @animatica/editor/modals/ScriptConsole
 */
import React, { useState, useCallback } from 'react';
import { getAiPrompt, validateScript, tryImportScript, useSceneStore } from '@Animatica/engine';
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
            const result = tryImportScript(script);

            if (result.ok) {
                // Get store actions (no subscription needed inside callback)
                const store = useSceneStore.getState();

                // 1. Clear existing scene
                store.actors.forEach((actor) => store.removeActor(actor.id));

                // 2. Import new scene
                store.setEnvironment(result.data.environment);
                store.setTimeline(result.data.timeline);
                result.data.actors.forEach((actor) => store.addActor(actor));

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
