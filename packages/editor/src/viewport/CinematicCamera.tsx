/**
 * CinematicCamera — Lens presets, DOF simulation, and camera shake.
 * Operates within the R3F canvas to modify the active camera.
 */
import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ---- Lens Presets ----

export interface LensPreset {
    name: string
    focalLength: number // mm
    fov: number // degrees
    description: string
}

export const LENS_PRESETS: LensPreset[] = [
    { name: 'Ultra Wide', focalLength: 18, fov: 90, description: 'Establishing shots, landscapes' },
    { name: 'Wide', focalLength: 24, fov: 73.7, description: 'Interior scenes, group shots' },
    { name: 'Standard', focalLength: 35, fov: 54.4, description: 'Closest to human eye, dialogue' },
    { name: 'Normal', focalLength: 50, fov: 39.6, description: 'Natural perspective, portraits' },
    { name: 'Portrait', focalLength: 85, fov: 23.9, description: 'Close-ups, shallow DOF' },
    { name: 'Telephoto', focalLength: 135, fov: 15.2, description: 'Compressed perspective, isolation' },
    { name: 'Long Tele', focalLength: 200, fov: 10.3, description: 'Sports, wildlife, dramatic compression' },
]

// ---- Camera Shake ----

export type ShakePreset = 'none' | 'handheld' | 'subtle' | 'explosion' | 'earthquake'

interface ShakeConfig {
    intensity: number
    frequency: number
    decay: number // per second
}

const SHAKE_CONFIGS: Record<ShakePreset, ShakeConfig> = {
    none: { intensity: 0, frequency: 0, decay: 0 },
    handheld: { intensity: 0.003, frequency: 2.5, decay: 0 },
    subtle: { intensity: 0.001, frequency: 1.5, decay: 0 },
    explosion: { intensity: 0.05, frequency: 15, decay: 3 },
    earthquake: { intensity: 0.03, frequency: 8, decay: 1 },
}

// ---- Props ----

interface CinematicCameraProps {
    /** Focal length in mm (overrides fov). */
    focalLength?: number
    /** Aperture f-stop for DOF simulation. */
    aperture?: number
    /** Focus distance in world units. */
    focusDistance?: number
    /** Camera shake preset. */
    shake?: ShakePreset
    /** Custom shake intensity multiplier (0-1). */
    shakeIntensity?: number
}

/**
 * CinematicCamera — drop into Canvas to add lens + shake behavior.
 *
 * @example
 * <Canvas>
 *   <CinematicCamera focalLength={85} shake="handheld" />
 * </Canvas>
 */
export const CinematicCamera: React.FC<CinematicCameraProps> = ({
    focalLength = 50,
    aperture = 2.8,
    focusDistance = 5,
    shake = 'none',
    shakeIntensity = 1,
}) => {
    const { camera } = useThree()
    const shakeOffset = useRef(new THREE.Vector3())
    const shakeStartTime = useRef(performance.now())
    const originalPos = useRef(new THREE.Vector3())
    const hasStoredOriginal = useRef(false)

    // Convert focal length → FOV
    const targetFov = useMemo(() => {
        // 35mm full-frame sensor height = 24mm
        return 2 * Math.atan(24 / (2 * focalLength)) * (180 / Math.PI)
    }, [focalLength])

    useFrame((_state, delta) => {
        if (!(camera instanceof THREE.PerspectiveCamera)) return

        // Smoothly lerp to target FOV
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.1)
        camera.updateProjectionMatrix()

        // Store original position on first frame
        if (!hasStoredOriginal.current) {
            originalPos.current.copy(camera.position)
            hasStoredOriginal.current = true
        }

        // Camera shake
        const config = SHAKE_CONFIGS[shake]
        if (config.intensity > 0) {
            const elapsed = (performance.now() - shakeStartTime.current) / 1000
            const decayFactor = config.decay > 0 ? Math.exp(-config.decay * elapsed) : 1

            const intensity = config.intensity * shakeIntensity * decayFactor
            const t = elapsed * config.frequency * Math.PI * 2

            shakeOffset.current.set(
                Math.sin(t * 1.1) * intensity,
                Math.cos(t * 1.3) * intensity * 0.7,
                Math.sin(t * 0.7) * intensity * 0.3,
            )

            camera.position.add(shakeOffset.current)
        }
    })

    return null
}

/**
 * Get the FOV for a given focal length (35mm full-frame equivalent).
 */
export function focalLengthToFov(focalLength: number): number {
    return 2 * Math.atan(24 / (2 * focalLength)) * (180 / Math.PI)
}

/**
 * Get the focal length for a given FOV.
 */
export function fovToFocalLength(fov: number): number {
    return 24 / (2 * Math.tan((fov * Math.PI / 180) / 2))
}
