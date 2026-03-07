/**
 * WeatherSystem — Visual effects for rain and snow.
 * Particle-based system using R3F.
 */
import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSceneStore } from '@Animatica/engine'

const PARTICLE_COUNT = 1500

export type WeatherType = 'clear' | 'rain' | 'snow'

export const WeatherSystem: React.FC = () => {
    const weather = useSceneStore((s) => s.environment.weather)
    const pointsRef = useRef<THREE.Points>(null)

    const particles = useMemo(() => {
        const pos = new Float32Array(PARTICLE_COUNT * 3)
        const vel = new Float32Array(PARTICLE_COUNT)

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 40
            pos[i * 3 + 1] = Math.random() * 20
            pos[i * 3 + 2] = (Math.random() - 0.5) * 40
            vel[i] = 0.1 + Math.random() * 0.2
        }

        return { pos, vel }
    }, [])

    useFrame((_state, delta) => {
        if (!pointsRef.current || weather.type === 'clear') return

        const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
        const speedMultiplier = weather.intensity * (weather.type === 'rain' ? 2.0 : 0.5)

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            positions[i * 3 + 1] -= particles.vel[i] * speedMultiplier * delta * 60

            if (positions[i * 3 + 1] < 0) {
                positions[i * 3 + 1] = 20
            }
        }

        pointsRef.current.geometry.attributes.position.needsUpdate = true
    })

    if (weather.type === 'clear') return null

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute args={[new Float32Array(0), 3]} args={[new Float32Array(0), 3]} args={[new Float32Array(0), 3]}
                    attach="attributes-position"
                    count={PARTICLE_COUNT}
                    array={particles.pos}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={weather.type === 'rain' ? 0.05 : 0.15}
                color={weather.type === 'rain' ? '#A5C9FF' : '#FFFFFF'}
                transparent
                opacity={0.6 * weather.intensity}
            />
        </points>
    )
}
