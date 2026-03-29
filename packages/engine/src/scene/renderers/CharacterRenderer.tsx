/**
 * CharacterRenderer — R3F component for rendering a character actor.
 * Dispatches to the Humanoid component with the appropriate rig.
 */
import React, { useMemo, memo, forwardRef, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { createProceduralHumanoid } from '../../character/CharacterLoader';
import { Humanoid } from '../../character/Humanoid';
import { getPreset } from '../../character/CharacterPresets';
import type { CharacterActor } from '../../types';

interface CharacterRendererProps {
    /** The character actor data containing transform, visibility, and state. */
    actor: CharacterActor;
    /** Whether the character is currently selected in the editor. */
    isSelected?: boolean;
    /** Callback when the character is clicked. */
    onClick?: () => void;
}

/**
 * CharacterRenderer — Orchestrates character loading and rendering.
 * Uses useMemo to build the character rig based on the actor's name/preset.
 *
 * @component
 * @example
 * ```tsx
 * <CharacterRenderer actor={myCharacterActor} isSelected={true} />
 * ```
 */
export const CharacterRenderer = memo(forwardRef<THREE.Group, CharacterRendererProps>(({
    actor,
    isSelected = false,
    onClick,
}, ref) => {
    const localRef = useRef<THREE.Group>(null);

    // Expose the group ref to parent components
    useImperativeHandle(ref, () => localRef.current as THREE.Group);

    // Build character rig based on actor name (matches preset ID)
    const rig = useMemo(() => {
        const preset = getPreset(actor.name.toLowerCase());
        const skinColor = preset?.body.skinColor || '#D4A27C';
        const height = preset?.body.height || 1.0;
        const build = preset?.body.build || 0.5;

        return createProceduralHumanoid({ skinColor, height, build });
    }, [actor.name]);

    if (!actor.visible) return null;

    return (
        <group
            ref={localRef}
            position={actor.transform.position}
            rotation={actor.transform.rotation}
            scale={actor.transform.scale}
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
        >
            <Humanoid
                actor={actor}
                rig={rig}
                isSelected={isSelected}
            />
        </group>
    );
}));

CharacterRenderer.displayName = 'CharacterRenderer';
