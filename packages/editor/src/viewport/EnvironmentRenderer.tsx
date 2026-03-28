/**
 * EnvironmentRenderer — Sky, ambient light, sun, fog, shadows.
 * Reads from sceneStore.environment.
 */
import React from 'react'
import { Sky, ContactShadows, Environment } from '@react-three/drei'
import { useSceneStore } from '@Animatica/engine'

export const EnvironmentRenderer: React.FC = () => {
    const env = useSceneStore((s: any) => s.environment)

    return (
        <>
            {/* Sky gradient */}
            <Sky
                distance={450000}
                sunPosition={env.sun.position}
                inclination={0.5}
                azimuth={0.25}
                turbidity={2}
                rayleigh={0.5}
                mieCoefficient={0.005}
                mieDirectionalG={0.8}
            />

            {/* Ambient fill light */}
            <ambientLight
                intensity={env.ambientLight.intensity}
                color={env.ambientLight.color}
            />

            {/* Sun (directional with shadows) */}
            <directionalLight
                position={env.sun.position}
                intensity={env.sun.intensity}
                color={env.sun.color}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-near={0.5}
                shadow-camera-far={50}
                shadow-camera-left={-20}
                shadow-camera-right={20}
                shadow-camera-top={20}
                shadow-camera-bottom={-20}
                shadow-bias={-0.0001}
            />

            {/* Contact shadows under objects */}
            <ContactShadows
                position={[0, -0.01, 0]}
                opacity={0.35}
                scale={40}
                blur={2}
                far={8}
                color="#000000"
            />

            {/* HDRI environment for reflections (subtle) */}
            <Environment preset="sunset" background={false} environmentIntensity={0.3} />

            {/* Fog (if configured) */}
            {env.fog && (
                <fog
                    attach="fog"
                    args={[env.fog.color, env.fog.near, env.fog.far]}
                />
            )}

            {/* Hemisphere light for natural ambient */}
            <hemisphereLight
                color="#B1E1FF"
                groundColor="#B97A20"
                intensity={0.15}
            />
        </>
    )
}
