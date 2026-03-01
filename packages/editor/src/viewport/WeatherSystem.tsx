/**
 * WeatherSystem — Particle-based weather effects for the viewport.
 * Supports rain, snow, and dust with configurable intensity.
 */
import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export type WeatherType = 'none' | 'rain' | 'snow' | 'dust'

interface WeatherSystemProps {
    type: WeatherType
    intensity?: number // 0-1
}

const PARTICLE_COUNT = 2000
const BOUNDS = 20 // spread area

/**
 * Generate initial particle positions.
 */
function createParticlePositions(count: number): Float32Array {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * BOUNDS
        positions[i * 3 + 1] = Math.random() * BOUNDS
        positions[i * 3 + 2] = (Math.random() - 0.5) * BOUNDS
    }
    return positions
}

/**
 * WeatherSystem renders particles that fall/float based on weather type.
 */
export const WeatherSystem: React.FC<WeatherSystemProps> = ({
    type,
    intensity = 0.5,
}) => {
    const pointsRef = useRef<THREE.Points>(null)

    const positions = useMemo(() => createParticlePositions(PARTICLE_COUNT), [])

    // Config per weather type
    const config = useMemo(() => {
        switch (type) {
            case 'rain':
                return {
                    speed: 8 * intensity,
                    size: 0.03,
                    color: '#8899bb',
                    opacity: 0.6 * intensity,
                    drift: 0.2,
                }
            case 'snow':
                return {
                    speed: 1.5 * intensity,
                    size: 0.06,
                    color: '#ffffff',
                    opacity: 0.8 * intensity,
                    drift: 1.5,
                }
            case 'dust':
                return {
                    speed: 0.3 * intensity,
                    size: 0.04,
                    color: '#c4a46a',
                    opacity: 0.4 * intensity,
                    drift: 3.0,
                }
            default:
                return null
        }
    }, [type, intensity])

    useFrame((_state, delta) => {
        if (!pointsRef.current || !config) return

        const geo = pointsRef.current.geometry
        const posAttr = geo.getAttribute('position') as THREE.BufferAttribute
        const arr = posAttr.array as Float32Array

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const i3 = i * 3

            // Y — fall
            arr[i3 + 1] -= config.speed * delta

            // X/Z — drift
            arr[i3] += Math.sin(Date.now() * 0.001 + i) * config.drift * delta * 0.1
            arr[i3 + 2] += Math.cos(Date.now() * 0.001 + i * 0.7) * config.drift * delta * 0.1

            // Respawn at top
            if (arr[i3 + 1] < -2) {
                arr[i3 + 1] = BOUNDS
                arr[i3] = (Math.random() - 0.5) * BOUNDS
                arr[i3 + 2] = (Math.random() - 0.5) * BOUNDS
            }
        }

        posAttr.needsUpdate = true
    })

    if (!config || type === 'none') return null

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    args={[positions, 3]}
                    attach="attributes-position"
                />
            </bufferGeometry>
            <pointsMaterial
                size={config.size}
                color={config.color}
                transparent
                opacity={config.opacity}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    )
}
