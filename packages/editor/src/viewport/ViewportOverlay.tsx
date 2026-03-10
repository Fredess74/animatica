/**
 * ViewportOverlay — 2D HUD rendered over the 3D canvas.
 * Shows FPS, camera info, and transform readout for selected actor.
 */
import React from 'react'
import { useSceneStore } from '@Animatica/engine'

export const ViewportOverlay: React.FC = () => {
    const selectedActor = useSceneStore((s) =>
        s.selectedActorId ? s.actors.find((a) => a.id === s.selectedActorId) : null
    )

    return (
        <div style={overlayContainerStyle}>
            {/* Bottom-left: selected actor transform */}
            {selectedActor && (
                <div style={transformReadoutStyle}>
                    <span style={labelStyle}>{selectedActor.name}</span>
                    <Row
                        label="Pos"
                        values={selectedActor.transform.position}
                        color="var(--green-400, #4ADE80)"
                    />
                    <Row
                        label="Rot"
                        values={selectedActor.transform.rotation.map(
                            (r) => Math.round(r * (180 / Math.PI) * 10) / 10
                        ) as [number, number, number]}
                        color="var(--text-secondary, #A3A3A3)"
                    />
                    <Row
                        label="Scl"
                        values={selectedActor.transform.scale}
                        color="var(--text-secondary, #A3A3A3)"
                    />
                </div>
            )}
        </div>
    )
}

const Row: React.FC<{
    label: string
    values: [number, number, number]
    color: string
}> = ({ label, values, color }) => (
    <div style={{ display: 'flex', gap: 8, fontSize: 11, fontFamily: 'var(--font-mono, monospace)' }}>
        <span style={{ color: 'var(--text-muted, #737373)', width: 24 }}>{label}</span>
        <span style={{ color }}>
            {values.map((v) => v.toFixed(2)).join('  ')}
        </span>
    </div>
)

const overlayContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 10,
}

const transformReadoutStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 12,
    left: 12,
    background: 'rgba(10, 10, 10, 0.8)',
    backdropFilter: 'blur(8px)',
    border: '1px solid var(--border-subtle, #2A2A2A)',
    borderRadius: 8,
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
}

const labelStyle: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-primary, #F5F5F0)',
    marginBottom: 4,
    fontFamily: 'var(--font-display, Space Grotesk)',
}
