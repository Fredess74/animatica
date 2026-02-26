/**
 * Viewport — Main 3D canvas container for the Animatica editor.
 * Renders the scene with postprocessing, controls, grid, and gizmo.
 * 
 * @module @animatica/editor/viewport
 */
import React, { Suspense, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { SceneRenderer } from './SceneRenderer'
import { ViewportGrid } from './ViewportGrid'
import { ViewportControls } from './ViewportControls'
import { ViewportGizmo } from './ViewportGizmo'
import { ViewportToolbar } from './ViewportToolbar'
import { ViewportOverlay } from './ViewportOverlay'
import { EnvironmentRenderer } from './EnvironmentRenderer'
import { useActorPicking } from './hooks/useActorPicking'
import { useViewportHotkeys } from './hooks/useViewportHotkeys'
import { useSceneStore } from '@animatica/engine'

// ---- Types ----

export type GizmoMode = 'translate' | 'rotate' | 'scale'
export type TransformSpace = 'world' | 'local'
export type ViewPreset = 'perspective' | 'top' | 'front' | 'right'

export interface ViewportState {
    gizmoMode: GizmoMode
    transformSpace: TransformSpace
    snapEnabled: boolean
    gridVisible: boolean
}

// ---- Component ----

export const Viewport: React.FC<{ className?: string }> = ({ className }) => {
    const [gizmoMode, setGizmoMode] = useState<GizmoMode>('translate')
    const [transformSpace, setTransformSpace] = useState<TransformSpace>('world')
    const [snapEnabled, setSnapEnabled] = useState(false)
    const [gridVisible, setGridVisible] = useState(true)

    const isPlaying = useSceneStore((s) => s.playback.isPlaying)

    const toggleSnap = useCallback(() => setSnapEnabled((v) => !v), [])
    const toggleGrid = useCallback(() => setGridVisible((v) => !v), [])
    const toggleSpace = useCallback(
        () => setTransformSpace((v) => (v === 'world' ? 'local' : 'world')),
        []
    )

    return (
        <div
            className={className}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                background: 'var(--bg-deep, #0A0A0A)',
                borderRadius: 'var(--radius-sm, 8px)',
            }}
        >
            {/* Toolbar strip above the 3D canvas */}
            <ViewportToolbar
                gizmoMode={gizmoMode}
                onGizmoModeChange={setGizmoMode}
                transformSpace={transformSpace}
                onTransformSpaceToggle={toggleSpace}
                snapEnabled={snapEnabled}
                onSnapToggle={toggleSnap}
                gridVisible={gridVisible}
                onGridToggle={toggleGrid}
            />

            {/* R3F 3D Canvas */}
            <Canvas
                shadows
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    preserveDrawingBuffer: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.0,
                }}
                camera={{ fov: 50, near: 0.1, far: 1000, position: [8, 6, 8] }}
                frameloop={isPlaying ? 'always' : 'demand'}
                style={{ position: 'absolute', top: 40, left: 0, right: 0, bottom: 0 }}
                onCreated={({ gl }) => {
                    gl.outputColorSpace = THREE.SRGBColorSpace
                }}
            >
                <Suspense fallback={null}>
                    {/* Environment: sky, lights, fog */}
                    <EnvironmentRenderer />

                    {/* Ground grid */}
                    {gridVisible && <ViewportGrid />}

                    {/* All scene actors */}
                    <SceneRenderer />

                    {/* Transform gizmo on selected actor */}
                    <ViewportGizmo
                        mode={gizmoMode}
                        space={transformSpace}
                        snapEnabled={snapEnabled}
                    />

                    {/* Orbit/pan/zoom controls */}
                    <ViewportControls />

                    {/* Internal hooks for picking + hotkeys */}
                    <SceneInteraction
                        onGizmoModeChange={setGizmoMode}
                        onTransformSpaceToggle={toggleSpace}
                    />
                </Suspense>
            </Canvas>

            {/* 2D HUD overlay */}
            <ViewportOverlay />
        </div>
    )
}

/**
 * Internal component for scene interactions.
 * Must be a child of Canvas to access R3F hooks.
 */
const SceneInteraction: React.FC<{
    onGizmoModeChange: (mode: GizmoMode) => void
    onTransformSpaceToggle: () => void
}> = ({ onGizmoModeChange, onTransformSpaceToggle }) => {
    useActorPicking()
    useViewportHotkeys({ onGizmoModeChange, onTransformSpaceToggle })
    return null
}
