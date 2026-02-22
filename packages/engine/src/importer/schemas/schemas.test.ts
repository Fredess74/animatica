import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  CharacterActor,
  ProjectState,
  Timeline,
  Vector3,
} from '../../types'
import {
  CharacterActorSchema,
  ActorSchema,
} from './actor'
import { Vector3Schema, TransformSchema } from './common'
import { ProjectStateSchema } from './project'
import { TimelineSchema } from './timeline'

describe('Zod Schemas', () => {
  describe('Common Schemas', () => {
    it('should validate Vector3', () => {
      const valid: Vector3 = [1, 2, 3]
      expect(Vector3Schema.parse(valid)).toEqual(valid)
      expect(() => Vector3Schema.parse([1, 2])).toThrow()
      expect(() => Vector3Schema.parse([1, 2, '3'])).toThrow()
    })

    it('should validate Transform', () => {
      const valid = {
        position: [0, 0, 0] as Vector3,
        rotation: [0, 0, 0] as Vector3,
        scale: [1, 1, 1] as Vector3,
      }
      expect(TransformSchema.parse(valid)).toEqual(valid)
    })
  })

  describe('Actor Schemas', () => {
    it('should validate CharacterActor', () => {
      const valid: CharacterActor = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Hero',
        type: 'character',
        transform: {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        },
        visible: true,
        animation: 'idle',
        morphTargets: {},
        bodyPose: {},
        clothing: {},
      }
      expect(CharacterActorSchema.parse(valid)).toEqual(valid)
      expect(ActorSchema.parse(valid)).toEqual(valid)
    })

    it('should reject invalid Actor', () => {
      const invalid = {
        id: 'not-a-uuid',
        name: 'Hero',
        type: 'character',
      }
      expect(() => ActorSchema.parse(invalid)).toThrow()
    })
  })

  describe('Timeline Schemas', () => {
    it('should validate Timeline', () => {
      const valid: Timeline = {
        duration: 10,
        cameraTrack: [],
        animationTracks: [
          {
            targetId: '123e4567-e89b-12d3-a456-426614174000',
            property: 'transform.position',
            keyframes: [
              { time: 0, value: [0, 0, 0], easing: 'linear' },
              { time: 1, value: [1, 0, 0] },
            ],
          },
        ],
      }
      expect(TimelineSchema.parse(valid)).toEqual(valid)
    })
  })

  describe('Project Schemas', () => {
    it('should validate ProjectState', () => {
      const valid: ProjectState = {
        meta: {
          title: 'My Movie',
          version: '1.0.0',
        },
        environment: {
          ambientLight: { intensity: 0.5, color: '#ffffff' },
          sun: { position: [10, 10, 10], intensity: 1, color: '#ffff00' },
          skyColor: '#87ceeb',
        },
        actors: [],
        timeline: {
          duration: 30,
          cameraTrack: [],
          animationTracks: [],
        },
        library: { clips: [] },
      }
      expect(ProjectStateSchema.parse(valid)).toEqual(valid)
    })
  })

  describe('Type Compatibility', () => {
      it('should ensure inferred types match interfaces', () => {
          type InferredProject = z.infer<typeof ProjectStateSchema>

          const data: ProjectState = {
            meta: { title: 'Test', version: '1.0.0' },
            environment: {
                ambientLight: { intensity: 1, color: '#ffffff'},
                sun: { position: [0,1,0], intensity: 1, color: '#ffffff' },
                skyColor: '#000000'
            },
            actors: [],
            timeline: { duration: 10, cameraTrack: [], animationTracks: [] },
            library: { clips: [] }
          }

          const parsed: InferredProject = ProjectStateSchema.parse(data)
          expect(parsed).toEqual(data)
      })
  })
})
