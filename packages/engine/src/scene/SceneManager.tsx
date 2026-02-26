/**
 * SceneManager — Orchestrates all scene renderers based on the Zustand store.
 * Reads actors from the store and delegates rendering to the appropriate component.
 * Handles environment setup (ambient light, sun, sky, fog, grid).
 *
 * @module @animatica/engine/scene/SceneManager
 */
import React, { useMemo } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { evaluateTracksAtTime } from '../animation/interpolate';
import { applyAnimationToActor, resolveActiveCamera } from './animationUtils';
import { SceneObject } from './SceneObject';
import type { Actor } from '../types';

interface SceneManagerProps {
    /** ID of the currently selected actor in the editor. */
    selectedActorId?: string;
    /** Callback when an actor is clicked. */
    onActorSelect?: (actorId: string) => void;
    /** Whether to show debug helpers (light gizmos, camera frustums, grid). */
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
    const actors = useSceneStore((s) => s.actors);
    const environment = useSceneStore((s) => s.environment);
    const timeline = useSceneStore((s) => s.timeline);
    const currentTime = useSceneStore((s) => s.playback.currentTime);

    // Evaluate all animation tracks at the current time
    const animationValues = useMemo(
        () => evaluateTracksAtTime(timeline.animationTracks, currentTime),
        [timeline.animationTracks, currentTime],
    );

    // Sort camera cuts only when the track changes, not every frame
    const sortedCameraCuts = useMemo(
        () => [...timeline.cameraTrack].sort((a, b) => a.time - b.time),
        [timeline.cameraTrack]
    );

    // Determine the active camera from the sorted camera cuts
    const activeCameraId = useMemo(
        () => resolveActiveCamera(sortedCameraCuts, currentTime),
        [sortedCameraCuts, currentTime],
    );

    // Apply animation values to actors
    const animatedActors = useMemo(
        () =>
            actors.map((actor: Actor) =>
                applyAnimationToActor(actor, animationValues.get(actor.id)),
            ),
        [actors, animationValues],
    );

    return (
        <>
            {/* === Environment === */}
            <ambientLight
                intensity={environment.ambientLight.intensity}
                color={environment.ambientLight.color}
            />
            <directionalLight
                position={environment.sun.position as unknown as [number, number, number]}
                intensity={environment.sun.intensity}
                color={environment.sun.color}
                castShadow
            />
            <color attach="background" args={[environment.skyColor]} />

            {environment.fog && (
                <fog
                    attach="fog"
                    args={[environment.fog.color, environment.fog.near, environment.fog.far]}
                />
            )}

            {showHelpers && <gridHelper args={[20, 20]} />}

            {/* === Actors === */}
            {animatedActors.map((actor: Actor) => (
                <SceneObject
                    key={actor.id}
                    actor={actor}
                    isSelected={actor.id === selectedActorId}
                    onSelect={() => onActorSelect?.(actor.id)}
                    isActiveCamera={actor.id === activeCameraId}
                    showHelpers={showHelpers}
                />
            ))}
        </>
    );
};
