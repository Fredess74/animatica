import React, { useMemo } from 'react';
import { useActorById, useActorTracks, useCurrentTime } from '../store/sceneStore';
import { evaluateTracksAtTime } from '../animation/interpolate';
import { applyAnimationToActor } from './animationUtils';
import { PrimitiveRenderer } from './renderers/PrimitiveRenderer';
import { LightRenderer } from './renderers/LightRenderer';
import { CameraRenderer } from './renderers/CameraRenderer';
import { CharacterRenderer } from './renderers/CharacterRenderer';
import { SpeakerRenderer } from './renderers/SpeakerRenderer';
import type {
    PrimitiveActor,
    LightActor,
    CameraActor,
    CharacterActor,
    SpeakerActor,
} from '../types';

interface SceneActorItemProps {
    actorId: string;
    isActiveCamera?: boolean;
    isSelected?: boolean;
    showHelpers?: boolean;
    onSelect?: (actorId: string) => void;
}

/**
 * SceneActorItem — Renders a single actor by subscribing to its specific state and animation tracks.
 * This component isolates updates, so only the animated actor re-renders on each frame.
 */
export const SceneActorItem: React.FC<SceneActorItemProps> = ({
    actorId,
    isActiveCamera = false,
    isSelected = false,
    showHelpers = false,
    onSelect,
}) => {
    const actor = useActorById(actorId);
    const tracks = useActorTracks(actorId);
    const currentTime = useCurrentTime();

    // Evaluate tracks for this specific actor at the current time
    const animationValues = useMemo(
        () => evaluateTracksAtTime(tracks, currentTime),
        [tracks, currentTime],
    );

    // Apply animation values to the actor
    const animatedActor = useMemo(
        () => actor ? applyAnimationToActor(actor, animationValues.get(actorId)) : null,
        [actor, actorId, animationValues],
    );

    if (!actor || !animatedActor) return null;

    switch (animatedActor.type) {
        case 'primitive':
            return (
                <PrimitiveRenderer
                    actor={animatedActor as PrimitiveActor}
                    isSelected={isSelected}
                    onClick={() => onSelect?.(actorId)}
                />
            );

        case 'light':
            return (
                <LightRenderer
                    actor={animatedActor as LightActor}
                    showHelper={showHelpers || isSelected}
                />
            );

        case 'camera':
            return (
                <CameraRenderer
                    actor={animatedActor as CameraActor}
                    isActive={isActiveCamera}
                    showHelper={showHelpers || isSelected}
                />
            );

        case 'character':
            return (
                <CharacterRenderer
                    actor={animatedActor as CharacterActor}
                    isSelected={isSelected}
                    onClick={() => onSelect?.(actorId)}
                />
            );

        case 'speaker':
            return (
                <SpeakerRenderer
                    actor={animatedActor as SpeakerActor}
                    showHelper={showHelpers || isSelected}
                />
            );

        default:
            return null;
    }
};
