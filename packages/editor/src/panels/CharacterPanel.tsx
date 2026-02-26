/**
 * CharacterPanel — Editor UI for character customization.
 * Provides preset picker, body sliders, expression selector, and animation controls.
 */
import React, { useState, useCallback } from 'react'
import { useSceneStore } from '@animatica/engine'
import { CHARACTER_PRESETS, EXPRESSION_PRESETS } from '@animatica/engine'
import type { CharacterActor, AnimationState } from '@animatica/engine'

const ANIMATIONS: AnimationState[] = ['idle', 'walk', 'run', 'wave', 'talk', 'dance', 'sit', 'jump']

export const CharacterPanel: React.FC = () => {
    const selectedActorId = useSceneStore((s) => s.selectedActorId)
    const actors = useSceneStore((s) => s.actors)
    const updateActor = useSceneStore((s) => s.updateActor)

    const selectedActor = actors.find((a) => a.id === selectedActorId) as CharacterActor | undefined

    if (!selectedActor || selectedActor.type !== 'character') {
        return (
            <div style={emptyStyle}>
                <span style={{ fontSize: 32 }}>🧑</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    Select a character to customize
                </span>
            </div>
        )
    }

    return (
        <div style={panelStyle}>
            <h3 style={titleStyle}>🧑 {selectedActor.name}</h3>

            {/* Preset Picker */}
            <Section title="PRESETS">
                <div style={presetsGridStyle}>
                    {CHARACTER_PRESETS.map((preset) => (
                        <button
                            key={preset.id}
                            title={preset.name}
                            style={{
                                ...presetBtnStyle,
                                border: selectedActor.name.toLowerCase() === preset.id
                                    ? '2px solid var(--green-500)'
                                    : '2px solid var(--border-subtle)',
                            }}
                            onClick={() => {
                                updateActor(selectedActor.id, {
                                    name: preset.name,
                                    animation: preset.animation as AnimationState,
                                } as Partial<CharacterActor>)
                            }}
                        >
                            <span style={{ fontSize: 20 }}>{preset.icon}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{preset.name}</span>
                        </button>
                    ))}
                </div>
            </Section>

            {/* Expression */}
            <Section title="EXPRESSION">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {Object.keys(EXPRESSION_PRESETS).map((name) => (
                        <button
                            key={name}
                            style={{
                                ...tagBtnStyle,
                                background: 'var(--bg-elevated)',
                                color: 'var(--text-secondary)',
                            }}
                            onClick={() => {
                                // Expression is stored in morphTargets
                                // CharacterRenderer reads this and applies via FaceMorphController
                                updateActor(selectedActor.id, {
                                    morphTargets: EXPRESSION_PRESETS[name] as any,
                                } as Partial<CharacterActor>)
                            }}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </Section>

            {/* Animation */}
            <Section title="ANIMATION">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {ANIMATIONS.map((anim) => (
                        <button
                            key={anim}
                            style={{
                                ...tagBtnStyle,
                                background: selectedActor.animation === anim
                                    ? 'var(--green-900)'
                                    : 'var(--bg-elevated)',
                                color: selectedActor.animation === anim
                                    ? 'var(--green-400)'
                                    : 'var(--text-secondary)',
                                border: selectedActor.animation === anim
                                    ? '1px solid var(--green-700)'
                                    : '1px solid transparent',
                            }}
                            onClick={() => {
                                updateActor(selectedActor.id, {
                                    animation: anim,
                                } as Partial<CharacterActor>)
                            }}
                        >
                            {anim}
                        </button>
                    ))}
                </div>

                {/* Speed slider */}
                <div style={{ marginTop: 8 }}>
                    <label style={sliderLabelStyle}>
                        Speed: {(selectedActor.animationSpeed ?? 1).toFixed(1)}x
                    </label>
                    <input
                        type="range"
                        min={0.1}
                        max={3}
                        step={0.1}
                        value={selectedActor.animationSpeed ?? 1}
                        onChange={(e) => {
                            updateActor(selectedActor.id, {
                                animationSpeed: parseFloat(e.target.value),
                            } as Partial<CharacterActor>)
                        }}
                        style={sliderStyle}
                    />
                </div>
            </Section>

            {/* Visibility */}
            <Section title="VISIBILITY">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={selectedActor.visible}
                        onChange={(e) => {
                            updateActor(selectedActor.id, { visible: e.target.checked })
                        }}
                    />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Visible</span>
                </label>
            </Section>
        </div>
    )
}

// ---- Sub-components ----

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{ marginBottom: 16 }}>
        <h4 style={sectionTitleStyle}>{title}</h4>
        {children}
    </div>
)

// ---- Styles ----

const panelStyle: React.CSSProperties = {
    padding: 12,
    height: '100%',
    overflowY: 'auto',
    fontFamily: 'var(--font-body)',
}

const emptyStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 8,
}

const titleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 16,
}

const sectionTitleStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    marginBottom: 8,
    fontFamily: 'var(--font-mono)',
}

const presetsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 4,
}

const presetBtnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 2px',
    borderRadius: 8,
    background: 'var(--bg-elevated)',
    cursor: 'pointer',
    transition: 'border-color 150ms',
    gap: 2,
}

const tagBtnStyle: React.CSSProperties = {
    padding: '4px 10px',
    borderRadius: 6,
    border: '1px solid transparent',
    cursor: 'pointer',
    fontSize: 12,
    transition: 'background 150ms',
}

const sliderLabelStyle: React.CSSProperties = {
    fontSize: 12,
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-mono)',
}

const sliderStyle: React.CSSProperties = {
    width: '100%',
    accentColor: 'var(--green-500)',
    marginTop: 4,
}
