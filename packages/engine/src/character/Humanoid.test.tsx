import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { Humanoid } from './Humanoid'

// Mock Three.js
vi.mock('three', async () => {
    const actual = await vi.importActual<typeof import('three')>('three')
    return {
        ...actual,
        Group: class extends actual.Object3D {
            type = 'Group';
        },
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
        useImperativeHandle: vi.fn(),
    }
})

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
    useGLTF: vi.fn().mockReturnValue({ scene: { type: 'Group' }, animations: [] }),
}))

// Mock CharacterLoader
vi.mock('./CharacterLoader', () => ({
    createProceduralHumanoid: vi.fn().mockReturnValue({
        root: { type: 'Group' },
    }),
    extractRig: vi.fn().mockReturnValue({
        root: { type: 'Group' },
    }),
}))

describe('Humanoid', () => {
    it('renders a group root', () => {
        // @ts-expect-error - Accessing internal render function for shallow test
        const result = Humanoid.type.render({ }, null)

        expect(result).not.toBeNull()
        expect(result.type).toBe('group')
        expect(result.props.name).toBe('humanoid-root')
    })

    it('renders procedural rig when no url is provided', () => {
        // @ts-expect-error - Accessing internal render function for shallow test
        const result = Humanoid.type.render({ }, null)
        const children = React.Children.toArray(result.props.children)

        // Should find a primitive object
        const primitive = children.find((c: any) => c.type === 'primitive')
        expect(primitive).toBeDefined()
    })

    it('renders GLBModel when url is provided', () => {
        // @ts-expect-error - Accessing internal render function for shallow test
        const result = Humanoid.type.render({ url: 'https://example.com/model.glb' }, null)
        const children = React.Children.toArray(result.props.children)

        // Should find a Suspense component or the model component
        const suspense = children.find((c: any) => c.type === React.Suspense || (c.type && c.type.toString().includes('Suspense')))
        expect(suspense).toBeDefined()
    })
})
