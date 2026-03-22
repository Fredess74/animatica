/**
 * Humanoid — R3F component that renders a humanoid character.
 * Supports loading external GLB models (e.g. ReadyPlayerMe) and falls back
 * to a procedurally generated rig if no URL is provided or loading fails.
 *
 * @module @animatica/engine/character/Humanoid
 */
import React, { useMemo, forwardRef, useImperativeHandle, useRef, Suspense, useEffect } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { createProceduralHumanoid, extractRig, type CharacterRig } from './CharacterLoader';

export interface HumanoidProps {
    /** URL to the .glb model file. */
    url?: string;
    /** Skin color for the procedural fallback. */
    skinColor?: string;
    /** Height multiplier for the procedural fallback. */
    height?: number;
    /** Build multiplier for the procedural fallback. */
    build?: number;
    /** Callback when the rig is loaded and ready. */
    onRigReady?: (rig: CharacterRig) => void;
}

/**
 * Internal component to load the GLTF model.
 * Separated to allow conditional loading without suspending the main component.
 */
const GLBModel: React.FC<{ url: string; onRigReady: (rig: CharacterRig) => void }> = ({ url, onRigReady }) => {
    // useGLTF will suspend this component until the model is loaded.
    const { scene, animations } = useGLTF(url);

    const rig = useMemo(() => {
        try {
            return extractRig(scene, animations);
        } catch (error) {
            console.error('[Humanoid] Failed to extract rig from GLTF:', error);
            return null;
        }
    }, [scene, animations]);

    useEffect(() => {
        if (rig) onRigReady(rig);
    }, [rig, onRigReady]);

    if (!rig) return null;

    return <primitive object={rig.root} />;
};

/**
 * Humanoid — Renders a rigged character model.
 *
 * @component
 */
export const Humanoid = React.memo(forwardRef<THREE.Group, HumanoidProps>(({
    url,
    skinColor = '#D4A27C',
    height = 1.0,
    build = 0.5,
    onRigReady,
}, ref) => {
    const groupRef = useRef<THREE.Group>(null);
    useImperativeHandle(ref, () => groupRef.current!);

    // Memoize procedural rig as a stable fallback
    const proceduralRig = useMemo(() =>
        createProceduralHumanoid({ skinColor, height, build }),
    [skinColor, height, build]);

    // If no URL is provided, we use the procedural rig immediately
    useEffect(() => {
        if (!url) {
            onRigReady?.(proceduralRig);
        }
    }, [url, proceduralRig, onRigReady]);

    return (
        <group ref={groupRef} name="humanoid-root">
            {url ? (
                <Suspense fallback={<primitive object={proceduralRig.root} />}>
                    <GLBModel url={url} onRigReady={(rig) => onRigReady?.(rig)} />
                </Suspense>
            ) : (
                <primitive object={proceduralRig.root} />
            )}
        </group>
    );
}));

Humanoid.displayName = 'Humanoid';
