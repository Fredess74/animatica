/**
 * StoryboardPanel — Shot list management for scene planning.
 * Create, reorder, and annotate shots for pre-visualization.
 */
import React, { useState, useCallback } from 'react'
import { useSceneStore } from '@Animatica/engine'

export interface Shot {
    id: string
    number: number
    name: string
    duration: number // seconds
    cameraId: string | null
    description: string
    notes: string
    shotType: ShotType
}

export type ShotType =
    | 'wide'
    | 'medium'
    | 'close-up'
    | 'extreme-close-up'
    | 'over-shoulder'
    | 'pov'
    | 'establishing'
    | 'insert'
    | 'tracking'
    | 'crane'

const SHOT_TYPE_LABELS: Record<ShotType, string> = {
    'wide': '🌐 Wide',
    'medium': '👤 Medium',
    'close-up': '🔍 Close-up',
    'extreme-close-up': '👁️ ECU',
    'over-shoulder': '🫱 Over Shoulder',
    'pov': '👀 POV',
    'establishing': '🏔️ Establishing',
    'insert': '📌 Insert',
    'tracking': '🎯 Tracking',
    'crane': '🏗️ Crane',
}

export const StoryboardPanel: React.FC = () => {
    const [shots, setShots] = useState<Shot[]>([
        {
            id: crypto.randomUUID(),
            number: 1,
            name: 'Opening',
            duration: 5,
            cameraId: null,
            description: 'Establishing shot of the scene',
            notes: '',
            shotType: 'establishing',
        },
    ])
    const [selectedShot, setSelectedShot] = useState<string | null>(null)

    const cameras = useSceneStore((s) => s.actors.filter((a) => a.type === 'camera'))

    const addShot = useCallback(() => {
        const newShot: Shot = {
            id: crypto.randomUUID(),
            number: shots.length + 1,
            name: `Shot ${shots.length + 1}`,
            duration: 3,
            cameraId: cameras[0]?.id || null,
            description: '',
            notes: '',
            shotType: 'medium',
        }
        setShots((prev) => [...prev, newShot])
    }, [shots.length, cameras])

    const removeShot = useCallback((id: string) => {
        setShots((prev) => prev.filter((s) => s.id !== id).map((s, i) => ({ ...s, number: i + 1 })))
    }, [])

    const updateShot = useCallback((id: string, update: Partial<Shot>) => {
        setShots((prev) =>
            prev.map((s) => (s.id === id ? { ...s, ...update } : s))
        )
    }, [])

    const moveShot = useCallback((id: string, direction: -1 | 1) => {
        setShots((prev) => {
            const idx = prev.findIndex((s) => s.id === id)
            if (idx < 0) return prev
            const newIdx = idx + direction
            if (newIdx < 0 || newIdx >= prev.length) return prev
            const arr = [...prev]
                ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
            return arr.map((s, i) => ({ ...s, number: i + 1 }))
        })
    }, [])

    const totalDuration = shots.reduce((sum, s) => sum + s.duration, 0)

    return (
        <div className="storyboard-panel">
            <div className="panel-header">
                <span>🎬 Storyboard</span>
                <span className="panel-header__meta">
                    {shots.length} shots · {totalDuration}s total
                </span>
            </div>

            <div className="storyboard-list">
                {shots.map((shot) => (
                    <div
                        key={shot.id}
                        className={`storyboard-card ${selectedShot === shot.id ? 'storyboard-card--selected' : ''}`}
                        onClick={() => setSelectedShot(shot.id)}
                    >
                        <div className="storyboard-card__header">
                            <span className="storyboard-card__number">#{shot.number}</span>
                            <input
                                className="storyboard-card__name"
                                value={shot.name}
                                onChange={(e) => updateShot(shot.id, { name: e.target.value })}
                                onClick={(e) => e.stopPropagation()}
                            />
                            <span className="storyboard-card__duration">{shot.duration}s</span>
                        </div>

                        <div className="storyboard-card__type">
                            <select
                                value={shot.shotType}
                                onChange={(e) => updateShot(shot.id, { shotType: e.target.value as ShotType })}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {Object.entries(SHOT_TYPE_LABELS).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <textarea
                            className="storyboard-card__desc"
                            placeholder="Describe this shot..."
                            value={shot.description}
                            onChange={(e) => updateShot(shot.id, { description: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            rows={2}
                        />

                        <div className="storyboard-card__actions">
                            <button onClick={(e) => { e.stopPropagation(); moveShot(shot.id, -1) }}>↑</button>
                            <button onClick={(e) => { e.stopPropagation(); moveShot(shot.id, 1) }}>↓</button>
                            <button onClick={(e) => { e.stopPropagation(); removeShot(shot.id) }}>🗑</button>
                        </div>
                    </div>
                ))}
            </div>

            <button className="storyboard-add" onClick={addShot}>
                + Add Shot
            </button>
        </div>
    )
}
