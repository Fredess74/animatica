import React, { useState, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';
import { useSceneStore } from '../store/sceneStore';
import * as THREE from 'three';

interface GizmoManagerProps {
    /** The ID of the currently selected actor. */
    selectedActorId?: string;
    /** The current transformation mode. */
    mode?: 'translate' | 'rotate' | 'scale';
}

/**
 * Manages the transform controls (gizmos) for the selected actor.
 * Syncs changes back to the Zustand store.
 *
 * @component
 */
export const GizmoManager: React.FC<GizmoManagerProps> = ({
    selectedActorId,
    mode = 'translate',
}) => {
    const { scene } = useThree();
    const updateActor = useSceneStore((s) => s.updateActor);
    // We subscribe to the actors list length/presence to retry finding the object
    // if it was just added or modified in a way that remounts it.
    const actors = useSceneStore((s) => s.actors);

    const [target, setTarget] = useState<THREE.Object3D | null>(null);

    // Find the object corresponding to the selected actor
    useEffect(() => {
        if (selectedActorId) {
            const obj = scene.getObjectByName(selectedActorId);
            setTarget(obj || null);
        } else {
            setTarget(null);
        }
    }, [selectedActorId, scene, actors]);

    if (!target) return null;

    return (
        <TransformControls
            object={target}
            mode={mode}
            space="local"
            onObjectChange={(e) => {
                if (!selectedActorId) return;

                // Cast to any because the event target type is not strictly typed in all versions
                const controls = e?.target as any;
                const object = controls?.object;

                if (!object) return;

                const position: [number, number, number] = [
                    object.position.x,
                    object.position.y,
                    object.position.z
                ];

                const rotation: [number, number, number] = [
                    object.rotation.x,
                    object.rotation.y,
                    object.rotation.z
                ];

                const scale: [number, number, number] = [
                    object.scale.x,
                    object.scale.y,
                    object.scale.z
                ];

                updateActor(selectedActorId, {
                    transform: {
                        position,
                        rotation,
                        scale,
                    }
                });
            }}
        />
    );
};
