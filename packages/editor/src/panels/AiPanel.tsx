/**
 * AiPanel — AI-powered scene generation panel for the editor.
 * Describe a scene → AI creates it → loads into viewport.
 */
import React, { useState, useCallback } from 'react'
import { useSceneStore } from '@Animatica/engine'
import type { Actor } from '@Animatica/engine'

const EXAMPLE_PROMPTS = [
    'A character standing in the rain waving hello',
    'Two characters dancing under spotlights on a dark stage',
    'A person sitting on a chair talking, with warm key lighting',
    'A character running through a snowy landscape',
    'A dramatic scene with a single figure and cinematic fog',
]

export const AiPanel: React.FC = () => {
    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const setEnvironment = useSceneStore((s) => s.setEnvironment)
    const setTimeline = useSceneStore((s) => s.setTimeline)

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim()) return

        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            })

            if (!res.ok) {
                throw new Error(`Generation failed (${res.status})`)
            }

            const scene = await res.json()

            if (scene.environment) setEnvironment(scene.environment)
            if (scene.timeline) setTimeline(scene.timeline)

            if (scene.actors && Array.isArray(scene.actors)) {
                useSceneStore.setState((state) => {
                    state.actors = scene.actors as Actor[]
                    state.selectedActorId = scene.actors[0]?.id ?? null
                })
            }

            setPrompt('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }, [prompt, setEnvironment, setTimeline])

    return (
        <div className="ai-panel">
            <div className="ai-panel__header">
                <span className="ai-panel__icon">🤖</span>
                <span className="ai-panel__title">AI Scene Generator</span>
            </div>

            <div className="ai-panel__body">
                <textarea
                    className="ai-panel__input"
                    placeholder="Describe a scene... (e.g. 'A person waving in the rain')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    disabled={loading}
                />

                <button
                    className="ai-panel__btn"
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                >
                    {loading ? '⏳ Generating...' : '✨ Generate Scene'}
                </button>

                {error && (
                    <div className="ai-panel__error">❌ {error}</div>
                )}

                <div className="ai-panel__examples">
                    <span className="ai-panel__examples-label">Try:</span>
                    {EXAMPLE_PROMPTS.map((p, i) => (
                        <button
                            key={i}
                            className="ai-panel__example"
                            onClick={() => setPrompt(p)}
                            disabled={loading}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
