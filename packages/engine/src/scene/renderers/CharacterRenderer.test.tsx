import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock Three.js
vi.mock('three', async () => {
    const actual = await vi.importActual<typeof import('three')>('three')
    return {
        ...actual,
        Vector3: class {
            x = 0; y = 0; z = 0;
            set = vi.fn().mockReturnThis();
            setFromMatrixPosition = vi.fn().mockReturnThis();
        },
        Group: class extends actual.Object3D {
            type = 'Group';
            children = [];
            getWorldPosition = vi.fn();
        },
        SkinnedMesh: class extends actual.Object3D {
            type = 'SkinnedMesh';
            geometry = { attributes: { position: { count: 100 } } };
            morphTargetDictionary = {};
        },
        DoubleSide: 2,
    }
})

// Mock React hooks
vi.mock('react', async () => {
    const actual = await vi.importActual<typeof import('react')>('react')
    return {
        ...actual,
        useRef: vi.fn().mockReturnValue({ current: null }),
        useMemo: vi.fn((fn) => fn()),
        useEffect: vi.fn(),
        useCallback: vi.fn((fn) => fn),
        useImperativeHandle: vi.fn(),
    }
})

// Mock R3F hooks
vi.mock('@react-three/fiber', () => ({
    useFrame: vi.fn(),
}))

// Mock character system
vi.mock('../../character', () => ({
    CharacterAnimator: vi.fn().mockImplementation(() => ({
        registerClip: vi.fn(),
        play: vi.fn(),
        setSpeed: vi.fn(),
        update: vi.fn(),
        dispose: vi.fn(),
    })),
    FaceMorphController: vi.fn().mockImplementation(() => ({
        setTarget: vi.fn(),
        update: vi.fn(),
        setImmediate: vi.fn(),
    })),
    EyeController: vi.fn().mockImplementation(() => ({
        update: vi.fn(),
    })),
    getPreset: vi.fn().mockReturnValue({
        body: { skinColor: '#D4A27C', height: 1.0, build: 0.5 }
    }),
    createIdleClip: vi.fn(),
    createWalkClip: vi.fn(),
    createRunClip: vi.fn(),
    createTalkClip: vi.fn(),
    createWaveClip: vi.fn(),
    createDanceClip: vi.fn(),
    createSitClip: vi.fn(),
    createJumpClip: vi.fn(),
    Humanoid: (props: any) => <div data-testid="humanoid" data-url={props.url} />,
}))

describe('CharacterRenderer', () => {
    const mockActor: CharacterActor = {
        id: 'char-1',
        name: 'Hero',
        type: 'character',
        visible: true,
        transform: {
            position: [10, 0, 5],
            rotation: [0, Math.PI, 0],
            scale: [1, 1, 1]
        },
        animation: 'idle',
        morphTargets: {},
        bodyPose: {},
        clothing: {}
    }

    it('renders a group with correct transform', () => {
        // @ts-expect-error - Accessing internal render function for shallow test
        const result = CharacterRenderer.type.render({ actor: mockActor }, null)

        expect(result).not.toBeNull()
        expect(result.type).toBe('group')

        const props = result.props
        expect(props.position).toEqual([10, 0, 5])
        expect(props.rotation).toEqual([0, Math.PI, 0])
        expect(props.scale).toEqual([1, 1, 1])
    })

    it('renders Humanoid child with avatarUrl', () => {
        const actorWithUrl = { ...mockActor, avatarUrl: 'https://example.com/model.glb' }
        // @ts-expect-error - Accessing internal render function for shallow test
        const result = CharacterRenderer.type.render({ actor: actorWithUrl }, null)

        const children = React.Children.toArray(result.props.children)
        // Check for Humanoid component in children
        const humanoid = children.find((c: any) => c.type && (typeof c.type === 'function' || typeof c.type === 'object'))

        expect(humanoid).toBeDefined()
        // @ts-ignore
        expect(humanoid.props.url).toBe('https://example.com/model.glb')
    })

    it('renders nothing when visible is false', () => {
        const invisibleActor = { ...mockActor, visible: false }
        // @ts-expect-error - Accessing internal render function for shallow test
        const result = CharacterRenderer.type.render({ actor: invisibleActor }, null)
        expect(result).toBeNull()
    })

    it('renders selection indicator when isSelected is true', () => {
        // @ts-expect-error - Accessing internal render function for shallow test
        const result = CharacterRenderer.type.render({ actor: mockActor, isSelected: true }, null)
        const children = React.Children.toArray(result.props.children)

        // Find the selection ring (mesh with ringGeometry)
        const ring = children.find((c: any) => {
            if (c.type !== 'mesh') return false
            const meshChildren = React.Children.toArray(c.props.children)
            return meshChildren.some((mc: any) => mc.type === 'ringGeometry')
        })

        expect(ring).toBeDefined()
    })
})
