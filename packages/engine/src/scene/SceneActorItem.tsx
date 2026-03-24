import React, { useMemo, memo } from 'react';
import { useActorById, useActorTracks, useCurrentTime } from '../store/sceneStore';
import { evaluateTracksAtTime } from '../animation/interpolate';
import { applyAnimationToActor } from './animationUtils';
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

interface SceneActorItemProps {
    id: string;
    selectedActorId?: string;
    onActorSelect?: (actorId: string) => void;
    showHelpers?: boolean;
    activeCameraId?: string;
}

/**
 * SceneActorItem — Renders a single actor with its animations.
 * Subscribes to only the state needed for this specific actor,
 * isolating high-frequency updates (currentTime) to the individual actor level.
 */
export const SceneActorItem: React.FC<SceneActorItemProps> = memo(({
    id,
    selectedActorId,
    onActorSelect,
    showHelpers = false,
    activeCameraId,
}) => {
    const actor = useActorById(id);
    const tracks = useActorTracks(id);
    const currentTime = useCurrentTime();

    // Evaluate animations for this specific actor
    const animatedActor = useMemo(() => {
        if (!actor) return null;
        const animationValues = evaluateTracksAtTime(tracks, currentTime);
        return applyAnimationToActor(actor, animationValues.get(id));
    }, [actor, tracks, currentTime, id]);

    if (!animatedActor) return null;

    const isSelected = id === selectedActorId;

    switch (animatedActor.type) {
        case 'primitive':
            return (
                <PrimitiveRenderer
                    key={animatedActor.id}
                    actor={animatedActor as PrimitiveActor}
                    isSelected={isSelected}
                    onClick={() => onActorSelect?.(animatedActor.id)}
                />
            );

        case 'light':
            return (
                <LightRenderer
                    key={animatedActor.id}
                    actor={animatedActor as LightActor}
                    showHelper={showHelpers || isSelected}
                />
            );

        case 'camera':
            return (
                <CameraRenderer
                    key={animatedActor.id}
                    actor={animatedActor as CameraActor}
                    isActive={animatedActor.id === activeCameraId}
                    showHelper={showHelpers || isSelected}
                />
            );

        case 'character':
            return (
                <CharacterRenderer
                    key={animatedActor.id}
                    actor={animatedActor as CharacterActor}
                    isSelected={isSelected}
                    onClick={() => onActorSelect?.(animatedActor.id)}
                />
            );

        case 'speaker':
            return (
                <SpeakerRenderer
                    key={animatedActor.id}
                    actor={animatedActor as SpeakerActor}
                    showHelper={showHelpers || isSelected}
                />
            );

        default:
            return null;
    }
});

SceneActorItem.displayName = 'SceneActorItem';
