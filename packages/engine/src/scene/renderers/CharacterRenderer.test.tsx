import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render } from '@testing-library/react'
import { CharacterRenderer } from './CharacterRenderer'
import { CharacterActor } from '../../types'
import * as THREE from 'three'

// Mock Three.js
vi.mock('three', async () => {
  const actual = await vi.importActual<typeof import('three')>('three')
  return {
    ...actual,
    AnimationMixer: vi.fn().mockImplementation(function() {
      return {
        clipAction: vi.fn().mockImplementation(() => ({
          setEffectiveWeight: vi.fn().mockReturnThis(),
          setEffectiveTimeScale: vi.fn().mockReturnThis(),
          play: vi.fn().mockReturnThis(),
          reset: vi.fn().mockReturnThis(),
          crossFadeTo: vi.fn().mockReturnThis(),
          stop: vi.fn().mockReturnThis(),
        })),
        update: vi.fn(),
        stopAllAction: vi.fn(),
      }
    }),
  }
})

// Mock the CharacterLoader
vi.mock('../../character/CharacterLoader', () => ({
  createProceduralHumanoid: vi.fn(() => ({
    root: new THREE.Group(),
    bodyMesh: new THREE.Mesh(),
    morphTargetMap: {},
  })),
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

  it('renders a group with correct name', () => {
    const { container } = render(<CharacterRenderer actor={mockActor} />)
    const group = container.querySelector('group')
    expect(group).not.toBeNull()
  })

  it('renders with visible prop correctly', () => {
    const invisibleActor = { ...mockActor, visible: false }
    const { container } = render(<CharacterRenderer actor={invisibleActor} />)
    const group = container.querySelector('group')
    expect(group).not.toBeNull()
  })
})
