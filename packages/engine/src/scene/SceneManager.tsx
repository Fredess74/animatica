/**
 * SceneManager — Orchestrates all scene renderers based on the Zustand store.
 * Reads actors from the store and delegates rendering to the appropriate component.
 * Handles environment setup (ambient light, sun, sky, fog).
 *
 * @module @animatica/engine/scene/SceneManager
 */
import React from 'react';
import {
    useActorIds,
    useAmbientLight,
    useSun,
    useSkyColor,
    useFog,
    useSceneStore,
    useCurrentTime,
} from '../store/sceneStore';
import { resolveActiveCamera } from './animationUtils';
import { SceneActorItem } from './SceneActorItem';

interface SceneManagerProps {
    /** ID of the currently selected actor in the editor. */
    selectedActorId?: string;
    /** Callback when an actor is clicked. */
    onActorSelect?: (actorId: string) => void;
    /** Whether to show debug helpers (light gizmos, camera frustums). */
    showHelpers?: boolean;
}

/**
 * SceneManager — the main scene orchestrator.
 * Reads actors, timeline, and environment from the Zustand store
 * and renders everything using the appropriate renderer components.
 *
 * @component
 * @example
 * ```tsx
 * <Canvas>
 *   <SceneManager
 *     selectedActorId={selectedId}
 *     onActorSelect={(id) => setSelectedId(id)}
 *     showHelpers={true}
 *   />
 * </Canvas>
 * ```
 */
export const SceneManager: React.FC<SceneManagerProps> = ({
    selectedActorId,
    onActorSelect,
    showHelpers = false,
}) => {
    const actorIds = useActorIds();
    const ambientLight = useAmbientLight();
    const sun = useSun();
    const skyColor = useSkyColor();
    const fog = useFog();
    const currentTime = useCurrentTime();

    // Determine the active camera from the timeline state (needed only for CameraRenderer isActive prop)
    const activeCameraId = useSceneStore((state) => {
        const sortedCameraCuts = [...state.timeline.cameraTrack].sort((a, b) => a.time - b.time);
        return resolveActiveCamera(sortedCameraCuts, currentTime);
    });

    return (
        <>
            {/* === Environment === */}
            <ambientLight
                intensity={ambientLight.intensity}
                color={ambientLight.color}
            />
            <directionalLight
                position={sun.position as unknown as [number, number, number]}
                intensity={sun.intensity}
                color={sun.color}
                castShadow
            />
            <color attach="background" args={[skyColor]} />

            {fog && (
                <fog
                    attach="fog"
                    args={[fog.color, fog.near, fog.far]}
                />
            )}

            {/* === Actors === */}
            {actorIds.map((id) => (
                <SceneActorItem
                    key={id}
                    actorId={id}
                    isActiveCamera={id === activeCameraId}
                    isSelected={id === selectedActorId}
                    showHelpers={showHelpers}
                    onSelect={onActorSelect}
                />
            ))}
        </>
    );
};
