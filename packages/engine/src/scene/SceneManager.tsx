/**
 * SceneManager — Orchestrates all scene renderers based on the Zustand store.
 * Reads actors from the store and delegates rendering to the appropriate component.
 * Handles environment setup (ambient light, sun, sky, fog).
 *
 * @module @animatica/engine/scene/SceneManager
 */
import React, { useMemo } from 'react';
import {
    useActorList,
    useAmbientLight,
    useSun,
    useSkyColor,
    useFog,
    useTimeline,
    useCurrentTime,
} from '../store/sceneStore';
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

/**
 * SceneEnvironment — Handles rendering of global scene properties.
 * Subscribes only to environment-related state to prevent redundant re-renders.
 */
const SceneEnvironment: React.FC = () => {
    const ambientLight = useAmbientLight();
    const sun = useSun();
    const skyColor = useSkyColor();
    const fog = useFog();

    return (
        <>
            <ambientLight intensity={ambientLight.intensity} color={ambientLight.color} />
            <directionalLight
                position={sun.position as unknown as [number, number, number]}
                intensity={sun.intensity}
                color={sun.color}
                castShadow
            />
            <color attach="background" args={[skyColor]} />
            {fog && <fog attach="fog" args={[fog.color, fog.near, fog.far]} />}
        </>
    );
};

interface SceneActorsProps {
    selectedActorId?: string;
    onActorSelect?: (actorId: string) => void;
    showHelpers?: boolean;
}

/**
 * SceneActors — Renders the dynamic collection of actors in the scene.
 * Subscribes to actors, timeline, and currentTime.
 */
const SceneActors: React.FC<SceneActorsProps> = ({
    selectedActorId,
    onActorSelect,
    showHelpers = false,
}) => {
    const actors = useActorList();
    const timeline = useTimeline();
    const currentTime = useCurrentTime();

    // Evaluate all animation tracks at the current time
    const animationValues = useMemo(
        () => evaluateTracksAtTime(timeline.animationTracks, currentTime),
        [timeline.animationTracks, currentTime],
    );

    // Sort camera cuts only when the track changes, not every frame
    const sortedCameraCuts = useMemo(
        () => [...timeline.cameraTrack].sort((a, b) => a.time - b.time),
        [timeline.cameraTrack],
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
            {animatedActors.map((actor: Actor) => {
                switch (actor.type) {
                    case 'primitive':
                        return (
                            <PrimitiveRenderer
                                key={actor.id}
                                actor={actor as PrimitiveActor}
                                isSelected={actor.id === selectedActorId}
                                onClick={() => onActorSelect?.(actor.id)}
                            />
                        );

                    case 'light':
                        return (
                            <LightRenderer
                                key={actor.id}
                                actor={actor as LightActor}
                                showHelper={showHelpers || actor.id === selectedActorId}
                            />
                        );

                    case 'camera':
                        return (
                            <CameraRenderer
                                key={actor.id}
                                actor={actor as CameraActor}
                                isActive={actor.id === activeCameraId}
                                showHelper={showHelpers || actor.id === selectedActorId}
                            />
                        );

                    case 'character':
                        return (
                            <CharacterRenderer
                                key={actor.id}
                                actor={actor as CharacterActor}
                                isSelected={actor.id === selectedActorId}
                                onClick={() => onActorSelect?.(actor.id)}
                            />
                        );

                    case 'speaker':
                        return (
                            <SpeakerRenderer
                                key={actor.id}
                                actor={actor as SpeakerActor}
                                showHelper={showHelpers || actor.id === selectedActorId}
                            />
                        );

                    default:
                        return null;
                }
            })}
        </>
    );
};

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
    return (
        <>
            <SceneEnvironment />
            <SceneActors
                selectedActorId={selectedActorId}
                onActorSelect={onActorSelect}
                showHelpers={showHelpers}
            />
        </>
    );
};
