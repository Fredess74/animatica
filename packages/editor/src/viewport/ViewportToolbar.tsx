/**
 * ViewportToolbar — Mode buttons, view presets, snap/grid toggles.
 * Rendered as a 40px strip above the 3D canvas.
 */
import React from 'react'
import type { GizmoMode, TransformSpace } from './Viewport'

interface ViewportToolbarProps {
    gizmoMode: GizmoMode
    onGizmoModeChange: (mode: GizmoMode) => void
    transformSpace: TransformSpace
    onTransformSpaceToggle: () => void
    snapEnabled: boolean
    onSnapToggle: () => void
    gridVisible: boolean
    onGridToggle: () => void
}

export const ViewportToolbar: React.FC<ViewportToolbarProps> = ({
    gizmoMode,
    onGizmoModeChange,
    transformSpace,
    onTransformSpaceToggle,
    snapEnabled,
    onSnapToggle,
    gridVisible,
    onGridToggle,
}) => {
    return (
        <div style={toolbarStyle}>
            {/* Gizmo mode group */}
            <div style={groupStyle}>
                <ToolBtn
                    label="W"
                    tooltip="Move (W)"
                    active={gizmoMode === 'translate'}
                    onClick={() => onGizmoModeChange('translate')}
                    icon="↔"
                />
                <ToolBtn
                    label="E"
                    tooltip="Rotate (E)"
                    active={gizmoMode === 'rotate'}
                    onClick={() => onGizmoModeChange('rotate')}
                    icon="⟳"
                />
                <ToolBtn
                    label="R"
                    tooltip="Scale (R)"
                    active={gizmoMode === 'scale'}
                    onClick={() => onGizmoModeChange('scale')}
                    icon="⤡"
                />
                <Divider />
                <ToolBtn
                    label="Q"
                    tooltip={`Space: ${transformSpace} (Q)`}
                    active={transformSpace === 'local'}
                    onClick={onTransformSpaceToggle}
                    icon={transformSpace === 'world' ? '🌐' : '📦'}
                />
            </div>

            {/* Toggles */}
            <div style={groupStyle}>
                <ToolBtn
                    tooltip="Snap to grid (Ctrl)"
                    active={snapEnabled}
                    onClick={onSnapToggle}
                    icon="🧲"
                />
                <ToolBtn
                    tooltip="Toggle grid"
                    active={gridVisible}
                    onClick={onGridToggle}
                    icon="⊞"
                />
                <Divider />
                <ToolBtn tooltip="Perspective View" active={false} onClick={() => {}} icon="🎥" />
                <ToolBtn tooltip="Top View" active={false} onClick={() => {}} icon=" top" />
                <ToolBtn tooltip="Front View" active={false} onClick={() => {}} icon=" front" />
                <ToolBtn tooltip="Side View" active={false} onClick={() => {}} icon=" side" />
            </div>
        </div>
    )
}

// ---- Sub-components ----

const ToolBtn: React.FC<{
    label?: string
    tooltip: string
    active: boolean
    onClick: () => void
    icon: string
}> = ({ tooltip, active, onClick, icon }) => {
    return (
        <button
            title={tooltip}
            onClick={onClick}
            style={{
                ...btnStyle,
                background: active ? 'var(--green-900, #0A5C36)' : 'transparent',
                color: active ? 'var(--green-400, #4ADE80)' : 'var(--text-secondary, #A3A3A3)',
                borderColor: active ? 'var(--green-700, #15803D)' : 'transparent',
            }}
        >
            {icon}
        </button>
    )
}

const Divider: React.FC = () => (
    <div
        style={{
            width: 1,
            height: 20,
            background: 'var(--border-subtle, #2A2A2A)',
            margin: '0 4px',
        }}
    />
)

// ---- Styles (inline to avoid CSS dependency order issues) ----

const toolbarStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    padding: '0 8px',
    background: 'var(--bg-surface, #1A1A1A)',
    borderBottom: '1px solid var(--border-subtle, #2A2A2A)',
    gap: 8,
    userSelect: 'none',
}

const groupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
}

const btnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 28,
    border: '1px solid transparent',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 16,
    transition: 'background 150ms ease-out',
    fontFamily: 'var(--font-mono, monospace)',
}
