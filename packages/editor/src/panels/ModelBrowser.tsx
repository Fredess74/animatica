/**
 * ModelBrowser — Built-in 3D model browser panel.
 * Browse bundled CC0 models, import from URL, or drag-drop GLB files.
 */
import React, { useState, useCallback } from 'react'
import { useSceneStore } from '@Animatica/engine'
import { BUNDLED_MODELS, type BundledModel } from '@Animatica/engine'

type Category = 'all' | 'character' | 'prop' | 'environment'

export const ModelBrowser: React.FC = () => {
    const [category, setCategory] = useState<Category>('all')
    const [importUrl, setImportUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const addActor = useSceneStore((s) => s.addActor)

    const filtered =
        category === 'all'
            ? BUNDLED_MODELS
            : BUNDLED_MODELS.filter((m) => m.category === category)

    const handleAddModel = useCallback(
        (model: BundledModel) => {
            addActor({
                id: crypto.randomUUID(),
                name: model.name,
                type: model.hasRig ? 'character' : 'primitive',
                transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                visible: true,
                ...(model.hasRig
                    ? { animation: 'idle', morphTargets: {}, bodyPose: {}, clothing: {} }
                    : {
                        properties: {
                            shape: 'box',
                            color: '#888888',
                            roughness: 0.5,
                            metalness: 0.3,
                            opacity: 1,
                            wireframe: false,
                        },
                    }),
                glbUrl: model.url,
            } as any)
        },
        [addActor]
    )

    const handleImportUrl = useCallback(async () => {
        if (!importUrl.trim()) return
        setLoading(true)
        try {
            addActor({
                id: crypto.randomUUID(),
                name: importUrl.split('/').pop()?.replace('.glb', '') || 'Imported Model',
                type: 'primitive',
                transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
                visible: true,
                properties: {
                    shape: 'box',
                    color: '#888888',
                    roughness: 0.5,
                    metalness: 0.3,
                    opacity: 1,
                    wireframe: false,
                },
                glbUrl: importUrl.trim(),
            } as any)
            setImportUrl('')
        } finally {
            setLoading(false)
        }
    }, [importUrl, addActor])

    return (
        <div className="model-browser">
            <div className="model-browser__header">
                <span className="model-browser__icon">📦</span>
                <span className="model-browser__title">Model Browser</span>
            </div>

            {/* Category tabs */}
            <div className="model-browser__tabs">
                {(['all', 'character', 'prop', 'environment'] as Category[]).map((cat) => (
                    <button
                        key={cat}
                        className={`model-browser__tab ${category === cat ? 'model-browser__tab--active' : ''}`}
                        onClick={() => setCategory(cat)}
                    >
                        {cat === 'all' ? '🌐 All' : cat === 'character' ? '🧑 Characters' : cat === 'prop' ? '🪑 Props' : '🏔️ Environ'}
                    </button>
                ))}
            </div>

            {/* Model grid */}
            <div className="model-browser__grid">
                {filtered.map((model) => (
                    <button
                        key={model.id}
                        className="model-browser__card"
                        onClick={() => handleAddModel(model)}
                        title={`${model.name} (${model.polyCount.toLocaleString()} polys) — ${model.license}`}
                    >
                        <div className="model-browser__card-thumb">{model.thumbnail}</div>
                        <div className="model-browser__card-name">{model.name}</div>
                        <div className="model-browser__card-meta">
                            {model.hasRig ? '🦴' : '📐'} {(model.polyCount / 1000).toFixed(1)}k
                        </div>
                    </button>
                ))}
            </div>

            {/* URL import */}
            <div className="model-browser__import">
                <input
                    className="model-browser__url-input"
                    placeholder="Paste .glb URL..."
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    disabled={loading}
                />
                <button
                    className="model-browser__import-btn"
                    onClick={handleImportUrl}
                    disabled={loading || !importUrl.trim()}
                >
                    {loading ? '⏳' : '📥'} Import
                </button>
            </div>

            {/* License notice */}
            <div className="model-browser__license">
                All bundled models are CC0 / CC-BY licensed. Safe for any use.
            </div>
        </div>
    )
}
