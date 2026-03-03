/**
 * ViewportGrid — Infinite ground grid with colored axis lines.
 * Uses @react-three/drei Grid component.
 */
import React from 'react'
import { Grid } from '@react-three/drei'

export const ViewportGrid: React.FC = () => {
    return (
        <group>
            {/* Infinite grid on XZ plane */}
            <Grid
                infiniteGrid
                cellSize={1}
                sectionSize={5}
                fadeDistance={60}
                fadeStrength={1.5}
                cellColor="#1A2B1F"
                sectionColor="#0D7A48"
                cellThickness={0.6}
                sectionThickness={1.2}
                followCamera
            />

            {/* X axis line (red) */}
            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[new Float32Array([-100, 0.001, 0, 100, 0.001, 0]), 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#EF4444" opacity={0.4} transparent />
            </line>

            {/* Z axis line (blue) */}
            <line>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[new Float32Array([0, 0.001, -100, 0, 0.001, 100]), 3]}
                    />
                </bufferGeometry>
                <lineBasicMaterial color="#3B82F6" opacity={0.4} transparent />
            </line>
        </group>
    )
}
