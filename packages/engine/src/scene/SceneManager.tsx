/**
 * SceneManager — Orchestrates all scene renderers based on the Zustand store.
 * Reads actors from the store and delegates rendering to the appropriate component.
 * Handles environment setup (ambient light, sun, sky, fog).
 *
 * @module @animatica/engine/scene
 */
import React, { useMemo } from 'react';
import { useSceneStore } from '../store/sceneStore';
import { evaluateTracksAtTime } from '../animation/interpolate';
import { PrimitiveRenderer } from './renderers/PrimitiveRenderer';
import { LightRenderer } from './renderers/LightRenderer';
import { CameraRenderer } from './renderers/CameraRenderer';
import { CharacterRenderer } from './renderers/CharacterRenderer';
import type {
    Actor,
    PrimitiveActor,
    LightActor,
    CameraActor,
    CharacterActor,
    CameraCut,
} from '../types';

/**
 * Props for the SceneManager component.
 */
interface SceneManagerProps {
    /** ID of the currently selected actor in the editor. */
    selectedActorId?: string;
    /** Callback when an actor is clicked. */
    onActorSelect?: (actorId: string) => void;
    /** Whether to show debug helpers (light gizmos, camera frustums). */
    showHelpers?: boolean;
}

/**
 * Resolves which camera should be active at a given time
 * based on the camera track (sorted cuts).
 */
function resolveActiveCamera(
    cameraCuts: CameraCut[],
    currentTime: number,
): string | null {
    if (cameraCuts.length === 0) return null;

    const sorted = [...cameraCuts].sort((a, b) => a.time - b.time);

    // Find the latest cut that has already occurred
    let activeId: string | null = null;
    for (const cut of sorted) {
        if (cut.time <= currentTime) {
            activeId = cut.cameraId;
        } else {
            break;
        }
    }

    return activeId;
}

/**
 * Applies interpolated animation values to an actor.
 * Returns a new actor object with the animated properties merged in.
 */
function applyAnimationToActor(
    actor: Actor,
    animatedProps: Map<string, unknown> | undefined,
): Actor {
    if (!animatedProps || animatedProps.size === 0) return actor;

    // Deep clone the actor to avoid mutating store
    const result = JSON.parse(JSON.stringify(actor)) as Actor;

    for (const [property, value] of animatedProps) {
        // Support dot-notation paths like "transform.position"
        const parts = property.split('.');
        let target: Record<string, unknown> = result as unknown as Record<string, unknown>;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (target[part] && typeof target[part] === 'object') {
                target = target[part] as Record<string, unknown>;
            } else {
                break;
            }
        }

        const lastPart = parts[parts.length - 1];
        target[lastPart] = value;
    }

    return result;
}

/**
 * SceneManager — the main scene orchestrator.
 * Reads actors, timeline, and environment from the Zustand store
 * and renders everything using the appropriate renderer components.
 *
 * @component
 * @param props {@link SceneManagerProps}
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
    const actors = useSceneStore((s: { actors: Actor[] }) => s.actors);
    const environment = useSceneStore((s: { environment: any }) => s.environment);
    const timeline = useSceneStore((s: { timeline: any }) => s.timeline);
    const currentTime = useSceneStore((s: { playback: { currentTime: number } }) => s.playback.currentTime);

    // Evaluate all animation tracks at the current time
    const animationValues = useMemo(
        () => evaluateTracksAtTime(timeline.animationTracks, currentTime),
        [timeline.animationTracks, currentTime],
    );

    // Determine the active camera from the camera track
    const activeCameraId = useMemo(
        () => resolveActiveCamera(timeline.cameraTrack, currentTime),
        [timeline.cameraTrack, currentTime],
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
                        // TODO: SpeakerRenderer not yet implemented
                        return null;

                    default:
                        return null;
                }
            })}
        </>
    );
};
