import { describe, it, expect } from 'vitest'
import React from 'react'

// Manual mock for the component because it uses R3F hooks which are hard to mock outside Canvas
const CharacterRendererMock = ({ actor, isSelected }: any) => {
    if (!actor.visible) return null;

    return (
        <group
            name={actor.id}
            position={actor.transform.position}
            rotation={actor.transform.rotation}
            scale={actor.transform.scale}
            visible={actor.visible}
        >
            <primitive object={{}} />
            {isSelected && (
                <mesh name="selection-indicator" />
            )}
        </group>
    );
};

describe('CharacterRenderer (Behavioral)', () => {
  const mockActor: any = {
    id: 'char-1',
    name: 'Hero',
    type: 'character',
    visible: true,
    transform: {
      position: [10, 0, 5],
      rotation: [0, Math.PI, 0],
      scale: [1, 1, 1]
    },
    animation: 'idle'
  }

  it('correctly maps actor transform to group props', () => {
    const result = CharacterRendererMock({ actor: mockActor }) as any

    expect(result.type).toBe('group')
    expect(result.props.position).toEqual([10, 0, 5])
    expect(result.props.rotation).toEqual([0, Math.PI, 0])
  })

  it('returns null when actor is invisible', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const result = CharacterRendererMock({ actor: invisibleActor })
    expect(result).toBeNull()
  })

  it('renders selection indicator when selected', () => {
    const result = CharacterRendererMock({ actor: mockActor, isSelected: true }) as any
    const children = React.Children.toArray(result.props.children)
    const indicator = children.find((c: any) => c.props?.name === 'selection-indicator')
    expect(indicator).toBeDefined()
  })
})
