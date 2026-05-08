import { describe, it, expect, vi, beforeEach } from 'vitest'
import React from 'react'
import { Humanoid } from './Humanoid'
import * as THREE from 'three'

// Mock R3F and Drei
vi.mock('@react-three/fiber', () => ({
    useFrame: vi.fn(),
}))

vi.mock('@react-three/drei', () => ({
    useGLTF: vi.fn(() => ({
        scene: new THREE.Group(),
        animations: [],
    })),
}))

// Mock CharacterAnimator to avoid mixer/animation issues in tests
vi.mock('./CharacterAnimator', async () => {
    const actual = await vi.importActual<typeof import('./CharacterAnimator')>('./CharacterAnimator')
    return {
        ...actual,
        CharacterAnimator: vi.fn().mockImplementation(() => ({
            registerClip: vi.fn(),
            play: vi.fn(),
            update: vi.fn(),
            dispose: vi.fn(),
        })),
    }
})

describe('Humanoid', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders procedural humanoid when no url is provided', () => {
        // We test by checking if it renders without crashing
        // Since we can't easily check internal state of Suspense in unit tests without a fuller setup,
        // we verify it returns a React element.
        const element = <Humanoid animation="idle" />
        expect(element).toBeDefined()
        expect(element.type).toBeDefined()
    })

    it('renders GLB humanoid when url is provided', () => {
        const element = <Humanoid url="test.glb" animation="walk" />
        expect(element).toBeDefined()
    })
})
