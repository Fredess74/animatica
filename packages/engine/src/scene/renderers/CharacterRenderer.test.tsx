import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'

// Mock react
vi.mock('react', async () => {
    const actual = await vi.importActual<typeof import('react')>('react')
    return {
        ...actual,
        useRef: vi.fn(() => ({ current: null })),
        useEffect: vi.fn(),
        useMemo: vi.fn((fn) => fn()),
    }
})

// Mock Three.js
vi.mock('three', () => {
    const Vector3 = vi.fn(() => ({
        setFromMatrixPosition: vi.fn().mockReturnThis(),
    }))
    return {
        Group: vi.fn(),
        Vector3,
        DoubleSide: 2,
    }
})

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
    useFrame: vi.fn(),
}))

// Mock internal engine components
vi.mock('../../character/CharacterLoader', () => ({
    createProceduralHumanoid: vi.fn(() => ({
        root: { name: 'rig-root' },
        bodyMesh: {},
        morphTargetMap: {},
    })),
}))

vi.mock('../../character/CharacterAnimator', () => ({
    CharacterAnimator: vi.fn(() => ({
        registerClip: vi.fn(),
        play: vi.fn(),
        setSpeed: vi.fn(),
        update: vi.fn(),
        dispose: vi.fn(),
    })),
    createIdleClip: vi.fn(),
    createWalkClip: vi.fn(),
    createRunClip: vi.fn(),
    createTalkClip: vi.fn(),
    createWaveClip: vi.fn(),
    createDanceClip: vi.fn(),
    createSitClip: vi.fn(),
    createJumpClip: vi.fn(),
}))

vi.mock('../../character/FaceMorphController', () => ({
    FaceMorphController: vi.fn(() => ({
        setTarget: vi.fn(),
        update: vi.fn(),
        setImmediate: vi.fn(),
    })),
}))

vi.mock('../../character/EyeController', () => ({
    EyeController: vi.fn(() => ({
        update: vi.fn(),
    })),
}))

vi.mock('../../character/CharacterPresets', () => ({
    getPreset: vi.fn(),
}))

describe('CharacterRenderer', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    const mockActor: CharacterActor = {
        id: 'char-1',
        name: 'Hero',
        type: 'character',
        visible: true,
        transform: {
            position: [10, 0, 5],
            rotation: [0, Math.PI, 0],
            scale: [1, 1, 1],
        },
        animation: 'idle',
        morphTargets: {},
        bodyPose: {},
        clothing: {},
    }

    it('renders a group containing primitive rig with correct transform', () => {
        // We call it as a function because we mocked hooks
        const result = CharacterRenderer({ actor: mockActor }) as React.ReactElement

        expect(result).not.toBeNull()
        expect(result.type).toBe('group')

        const props = result.props as any
        expect(props.position).toEqual([10, 0, 5])
        expect(props.rotation).toEqual([0, Math.PI, 0])
        expect(props.scale).toEqual([1, 1, 1])

        // Verify children
        const children = React.Children.toArray(props.children) as any[]

        // First child should be the primitive object (rig)
        const primitive = children[0]
        expect(primitive.type).toBe('primitive')
        expect(primitive.props.object).toEqual({ name: 'rig-root' })
    })

    it('renders selection ring when selected', () => {
        const result = CharacterRenderer({ actor: mockActor, isSelected: true }) as React.ReactElement
        const props = result.props as any
        const children = React.Children.toArray(props.children) as any[]

        // Second child should be the selection ring mesh
        const selectionRing = children[1]
        expect(selectionRing).toBeDefined()
        expect(selectionRing.type).toBe('mesh')

        const meshChildren = React.Children.toArray(selectionRing.props.children) as any[]
        expect(meshChildren.some(child => (child as any).type === 'ringGeometry')).toBe(true)
    })

    it('renders nothing when visible is false', () => {
        const invisibleActor = { ...mockActor, visible: false }
        const result = CharacterRenderer({ actor: invisibleActor }) as React.ReactElement
        expect(result).toBeNull()
    })
})
