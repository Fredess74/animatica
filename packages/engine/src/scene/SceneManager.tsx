/**
 * SceneManager — Orchestrates all scene renderers based on the Zustand store.
 * Reads actors from the store and delegates rendering to the appropriate component.
 * Handles environment setup (ambient light, sun, sky, fog).
 *
 * @module @animatica/engine/scene/SceneManager
 */
import React, { useMemo, memo } from 'react';
import { useSceneStore, useEnvironmentValue, useTimelineValue, useCurrentTime, useActorIds } from '../store/sceneStore';
import { evaluateTracksAtTime } from '../animation/interpolate';
import { applyAnimationToActor, resolveActiveCamera } from './animationUtils';
import { PrimitiveRenderer } from './renderers/PrimitiveRenderer';
import { LightRenderer } from './renderers/LightRenderer';
import { CameraRenderer } from './renderers/CameraRenderer';
import { CharacterRenderer } from './renderers/CharacterRenderer';
import { SpeakerRenderer } from './renderers/SpeakerRenderer';
import type {
    Actor,
    PrimitiveActor,
    LightActor,
    CameraActor,
    CharacterActor,
    SpeakerActor,
} from '../types';

interface SceneManagerProps {
    /** ID of the currently selected actor in the editor. */
    selectedActorId?: string;
    /** Callback when an actor is clicked. */
    onActorSelect?: (actorId: string) => void;
    /** Whether to show debug helpers (light gizmos, camera frustums). */
    showHelpers?: boolean;
}

/**
 * SceneEnvironment — Renders lights, sky, and fog.
 * Subscribes only to environment state.
 */
const SceneEnvironment: React.FC = memo(() => {
    const environment = useEnvironmentValue((s) => s);

    return (
        <>
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
        </>
    );
});

SceneEnvironment.displayName = 'SceneEnvironment';

interface SceneActorsProps extends SceneManagerProps {
    actorIds: string[];
}

/**
 * SceneActorItem — Renders a single actor.
 * Subscribes only to that actor's state.
 */
const SceneActorItem: React.FC<{
    actorId: string;
    animationValues: Map<string, unknown> | undefined;
    activeCameraId: string | null;
    selectedActorId?: string;
    onActorSelect?: (id: string) => void;
    showHelpers?: boolean;
}> = memo(({
    actorId,
    animationValues,
    activeCameraId,
    selectedActorId,
    onActorSelect,
    showHelpers = false,
}) => {
    const actor = useSceneStore((s) => s.actors.find(a => a.id === actorId));
    if (!actor) return null;

    const animatedActor = applyAnimationToActor(actor, animationValues);

    switch (animatedActor.type) {
        case 'primitive':
            return (
                <PrimitiveRenderer
                    key={animatedActor.id}
                    actor={animatedActor as PrimitiveActor}
                    isSelected={animatedActor.id === selectedActorId}
                    onClick={() => onActorSelect?.(animatedActor.id)}
                />
            );

        case 'light':
            return (
                <LightRenderer
                    key={animatedActor.id}
                    actor={animatedActor as LightActor}
                    showHelper={showHelpers || animatedActor.id === selectedActorId}
                />
            );

        case 'camera':
            return (
                <CameraRenderer
                    key={animatedActor.id}
                    actor={animatedActor as CameraActor}
                    isActive={animatedActor.id === activeCameraId}
                    showHelper={showHelpers || animatedActor.id === selectedActorId}
                />
            );

        case 'character':
            return (
                <CharacterRenderer
                    key={animatedActor.id}
                    actor={animatedActor as CharacterActor}
                    isSelected={animatedActor.id === selectedActorId}
                    onClick={() => onActorSelect?.(animatedActor.id)}
                />
            );

        case 'speaker':
            return (
                <SpeakerRenderer
                    key={animatedActor.id}
                    actor={animatedActor as SpeakerActor}
                    showHelper={showHelpers || animatedActor.id === selectedActorId}
                />
            );

        default:
            return null;
    }
});

SceneActorItem.displayName = 'SceneActorItem';

/**
 * SceneActors — Renders all actors and evaluates animations.
 * Subscribes to actors, timeline, and high-frequency currentTime.
 */
const SceneActors: React.FC<SceneActorsProps> = memo(({
    actorIds,
    selectedActorId,
    onActorSelect,
    showHelpers = false,
}) => {
    const animationTracks = useTimelineValue((s) => s.animationTracks);
    const cameraTrack = useTimelineValue((s) => s.cameraTrack);
    const currentTime = useCurrentTime();

    // Evaluate all animation tracks at the current time
    const animationValues = useMemo(
        () => evaluateTracksAtTime(animationTracks, currentTime),
        [animationTracks, currentTime],
    );

    // Sort camera cuts only when the track changes, not every frame
    const sortedCameraCuts = useMemo(
        () => [...cameraTrack].sort((a, b) => a.time - b.time),
        [cameraTrack]
    );

    // Determine the active camera from the sorted camera cuts
    const activeCameraId = useMemo(
        () => resolveActiveCamera(sortedCameraCuts, currentTime),
        [sortedCameraCuts, currentTime],
    );

    return (
        <>
            {actorIds.map((actorId) => (
                <SceneActorItem
                    key={actorId}
                    actorId={actorId}
                    animationValues={animationValues.get(actorId)}
                    activeCameraId={activeCameraId}
                    selectedActorId={selectedActorId}
                    onActorSelect={onActorSelect}
                    showHelpers={showHelpers}
                />
            ))}
        </>
    );
});

SceneActors.displayName = 'SceneActors';

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
export const SceneManager: React.FC<SceneManagerProps> = (props) => {
    const actorIds = useActorIds();

    return (
        <>
            <SceneEnvironment />
            <SceneActors actorIds={actorIds} {...props} />
        </>
    );
};
