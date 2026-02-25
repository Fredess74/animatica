/**
 * The Scene Orchestration Module.
 * Responsible for rendering the entire 3D scene based on the current state.
 *
 * @module @animatica/engine/scene/SceneManager
 */
import React, { useMemo } from 'react';
import { useSceneStore } from '../store/sceneStore';
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
 * The main component for rendering the scene.
 * It subscribes to the Zustand store to get the list of actors, environment settings,
 * and animation timeline, then orchestrates the rendering of each element.
 *
 * Features:
 * - Renders Environment (Sky, Sun, Ambient Light, Fog)
 * - Renders Actors (Primitives, Lights, Cameras, Characters) via specialized renderers
 * - Evaluates Animation Tracks at the current playback time
 * - Resolves active camera cuts
 *
 * @component
 * @param props {@link SceneManagerProps}
 * @returns A React fragment containing lights, environment, and actor components.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <SceneManager
 *     selectedActorId="some-uuid"
 *     onActorSelect={(id) => console.log('Selected:', id)}
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

            {/* === Actors === */}
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
