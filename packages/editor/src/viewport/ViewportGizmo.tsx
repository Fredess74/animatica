/**
 * ViewportGizmo — TransformControls wrapper that syncs with the scene store.
 * Supports translate/rotate/scale modes, world/local space, and snapping.
 */
import React, { useEffect, useState, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { TransformControls } from '@react-three/drei'
import * as THREE from 'three'
import { useSceneStore } from '@Animatica/engine'
import type { GizmoMode, TransformSpace } from './Viewport'

interface ViewportGizmoProps {
    mode: GizmoMode
    space: TransformSpace
    snapEnabled: boolean
}

const SNAP_TRANSLATE = 0.5
const SNAP_ROTATE = THREE.MathUtils.degToRad(15)
const SNAP_SCALE = 0.25

export const ViewportGizmo: React.FC<ViewportGizmoProps> = ({
    mode,
    space,
    snapEnabled,
}) => {
    const selectedActorId = useSceneStore((s: any) => s.selectedActorId)
    const updateActor = useSceneStore((s: any) => s.updateActor)
    const { scene } = useThree()
    const [target, setTarget] = useState<THREE.Object3D | null>(null)
    const controlsRef = useRef<any>(null)

    // Find the selected object in the scene graph
    useEffect(() => {
        if (!selectedActorId) {
            setTarget(null)
            return
        }

        // Small delay to ensure object is mounted
        const timeout = setTimeout(() => {
            const obj = scene.getObjectByName(selectedActorId)
            setTarget(obj || null)
        }, 50)

        return () => clearTimeout(timeout)
    }, [selectedActorId, scene])

    // Determine snap values based on mode
    const snapValue = snapEnabled
        ? mode === 'translate'
            ? SNAP_TRANSLATE
            : mode === 'rotate'
                ? SNAP_ROTATE
                : SNAP_SCALE
        : undefined

    if (!target || !selectedActorId) return null

    return (
        <TransformControls
            ref={controlsRef}
            object={target}
            mode={mode}
            space={space}
            translationSnap={snapEnabled ? SNAP_TRANSLATE : null}
            rotationSnap={snapEnabled ? SNAP_ROTATE : null}
            scaleSnap={snapEnabled ? SNAP_SCALE : null}
            size={0.8}
            onObjectChange={() => {
                if (!target) return

                // Sync Three.js object back to store
                updateActor(selectedActorId, {
                    transform: {
                        position: [target.position.x, target.position.y, target.position.z],
                        rotation: [target.rotation.x, target.rotation.y, target.rotation.z],
                        scale: [target.scale.x, target.scale.y, target.scale.z],
                    },
                })
            }}
        />
    )
}
