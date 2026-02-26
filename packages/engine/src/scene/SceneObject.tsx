/**
 * SceneObject — Renders a single actor based on its type.
 * Dispatches the rendering to the appropriate specialized renderer.
 *
 * @module @animatica/engine/scene/SceneObject
 */
import React from 'react';
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

export interface SceneObjectProps {
    /** The actor data object. */
    actor: Actor;
    /** Whether this actor is currently selected in the editor. */
    isSelected?: boolean;
    /** Callback when the actor is selected. */
    onSelect?: () => void;
    /** Whether this actor is the active camera. */
    isActiveCamera?: boolean;
    /** Whether to show debug helpers (light gizmos, camera frustums). */
    showHelpers?: boolean;
}

/**
 * SceneObject component that renders the appropriate renderer for an actor.
 */
export const SceneObject: React.FC<SceneObjectProps> = ({
    actor,
    isSelected = false,
    onSelect,
    isActiveCamera = false,
    showHelpers = false,
}) => {
    switch (actor.type) {
        case 'primitive':
            return (
                <PrimitiveRenderer
                    actor={actor as PrimitiveActor}
                    isSelected={isSelected}
                    onClick={onSelect}
                />
            );

        case 'light':
            return (
                <LightRenderer
                    actor={actor as LightActor}
                    showHelper={showHelpers || isSelected}
                />
            );

        case 'camera':
            return (
                <CameraRenderer
                    actor={actor as CameraActor}
                    isActive={isActiveCamera}
                    showHelper={showHelpers || isSelected}
                />
            );

        case 'character':
            return (
                <CharacterRenderer
                    actor={actor as CharacterActor}
                    isSelected={isSelected}
                    onClick={onSelect}
                />
            );

        case 'speaker':
            return (
                <SpeakerRenderer
                    actor={actor as SpeakerActor}
                    showHelper={showHelpers || isSelected}
                />
            );

        default:
            return null;
    }
};
