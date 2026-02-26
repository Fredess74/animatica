/**
 * ViewportControls — Camera orbit/pan/zoom controls with view preset support.
 */
import React, { useRef, useCallback, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

const VIEW_POSITIONS: Record<string, [number, number, number]> = {
    perspective: [8, 6, 8],
    top: [0, 15, 0.001],
    front: [0, 2, 12],
    right: [12, 2, 0],
}

export const ViewportControls: React.FC = () => {
    const controlsRef = useRef<any>(null)

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.08}
            minDistance={0.5}
            maxDistance={200}
            maxPolarAngle={Math.PI * 0.95}
            mouseButtons={{
                LEFT: THREE.MOUSE.ROTATE,
                MIDDLE: THREE.MOUSE.PAN,
                RIGHT: THREE.MOUSE.PAN,
            }}
        />
    )
}

/**
 * Animate camera to a preset view position.
 * Can be called from toolbar buttons.
 */
export const useCameraPreset = () => {
    const { camera } = useThree()

    const goToPreset = useCallback(
        (preset: keyof typeof VIEW_POSITIONS) => {
            const target = VIEW_POSITIONS[preset]
            if (!target) return

            // Smooth lerp to target position
            const start = camera.position.clone()
            const end = new THREE.Vector3(...target)
            const duration = 500
            const startTime = performance.now()

            const animate = () => {
                const elapsed = performance.now() - startTime
                const t = Math.min(elapsed / duration, 1)
                const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic

                camera.position.lerpVectors(start, end, eased)
                camera.lookAt(0, 0, 0)

                if (t < 1) {
                    requestAnimationFrame(animate)
                }
            }

            animate()
        },
        [camera]
    )

    return { goToPreset }
}
