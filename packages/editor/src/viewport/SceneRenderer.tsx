/**
 * SceneRenderer — Iterates all actors from the store and renders the correct component.
 */
import React, { memo } from 'react'
import {
    useSceneStore,
    useActors,
    useSelectedActorId,
    PrimitiveRenderer,
    LightRenderer,
    CameraRenderer,
} from '@Animatica/engine'
import type { Actor } from '@Animatica/engine'

export const SceneRenderer: React.FC = () => {
    const actors = useActors()
    const selectedActorId = useSelectedActorId()
    const setSelectedActor = useSceneStore((s) => s.setSelectedActor)

    return (
        <group data-testid="scene-manager">
            {actors.map((actor) => (
                <ActorSwitch
                    key={actor.id}
                    actor={actor}
                    isSelected={actor.id === selectedActorId}
                    onSelect={setSelectedActor}
                />
            ))}
        </group>
    )
}

/**
 * Routes each actor to the correct renderer based on actor.type.
 */
const ActorSwitch = memo<{
    actor: Actor
    isSelected: boolean
    onSelect: (id: string | null) => void
}>(({ actor, isSelected, onSelect }) => {
    if (!actor.visible) return null

    const commonProps = {
        actor,
        isSelected,
        onClick: () => onSelect(actor.id),
    }

    switch (actor.type) {
        case 'primitive':
            return <PrimitiveRenderer {...commonProps} actor={actor} />
        case 'light':
            return <LightRenderer {...commonProps} actor={actor} showHelper={true} />
        case 'camera':
            return <CameraRenderer {...commonProps} actor={actor} showHelper={true} />
        case 'character':
            // TODO: CharacterRenderer - Sprint 3
            return (
                <group
                    name={actor.id}
                    position={actor.transform.position}
                    rotation={actor.transform.rotation}
                    scale={actor.transform.scale}
                    onClick={(e) => { e.stopPropagation(); onSelect(actor.id) }}
                >
                    {/* Placeholder capsule until CharacterRenderer is ready */}
                    <mesh castShadow>
                        <capsuleGeometry args={[0.3, 1.2, 8, 16]} />
                        <meshStandardMaterial
                            color={isSelected ? '#22C55E' : '#A3A3A3'}
                            roughness={0.5}
                        />
                    </mesh>
                </group>
            )
        case 'speaker':
            return (
                <group
                    name={actor.id}
                    position={actor.transform.position}
                    onClick={(e) => { e.stopPropagation(); onSelect(actor.id) }}
                >
                    {/* Speaker icon placeholder */}
                    <mesh>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        <meshStandardMaterial
                            color={isSelected ? '#22C55E' : '#4ADE80'}
                            emissive={isSelected ? '#22C55E' : '#000000'}
                            emissiveIntensity={isSelected ? 0.3 : 0}
                        />
                    </mesh>
                </group>
            )
        default:
            return null
    }
})

ActorSwitch.displayName = 'ActorSwitch'
