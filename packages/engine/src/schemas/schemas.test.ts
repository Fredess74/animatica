import { describe, it, expect } from 'vitest';
import {
    Vector3Schema,
    ColorSchema,
    UUIDSchema,
    TransformSchema,
    CharacterActorSchema,
    PrimitiveActorSchema,
    LightActorSchema,
    CameraActorSchema,
    SpeakerActorSchema,
    ActorSchema,
} from './index';
import {
    TimelineSchema,
    EnvironmentSchema,
    ProjectStateSchema,
    ProjectMetaSchema,
} from './scene.schema';

// ---- Valid test data ----

const validTransform = {
    position: [0, 1, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    scale: [1, 1, 1] as [number, number, number],
};

const validCharacter = {
    id: 'char-001',
    name: 'Hero',
    type: 'character' as const,
    transform: validTransform,
    visible: true,
    animation: 'idle' as const,
    morphTargets: { mouthSmile: 0.5 },
    bodyPose: { head: [0, 0, 0] as [number, number, number] },
    clothing: { head: [], torso: [] },
};

const validPrimitive = {
    id: 'prim-001',
    name: 'Floor',
    type: 'primitive' as const,
    transform: validTransform,
    visible: true,
    properties: {
        shape: 'box' as const,
        color: '#ff0000',
        roughness: 0.5,
        metalness: 0.1,
        opacity: 1,
        wireframe: false,
    },
};

const validLight = {
    id: 'light-001',
    name: 'Sun Light',
    type: 'light' as const,
    transform: validTransform,
    visible: true,
    properties: {
        lightType: 'directional' as const,
        intensity: 1.5,
        color: '#ffffff',
        castShadow: true,
    },
};

const validCamera = {
    id: 'cam-001',
    name: 'Main Camera',
    type: 'camera' as const,
    transform: validTransform,
    visible: true,
    properties: { fov: 75, near: 0.1, far: 1000 },
};

const validSpeaker = {
    id: 'spk-001',
    name: 'BGM',
    type: 'speaker' as const,
    transform: validTransform,
    visible: true,
    properties: { volume: 0.8, loop: true, spatial: false },
};

// ---- Tests ----

describe('Primitive Schemas', () => {
    it('validates Vector3', () => {
        expect(Vector3Schema.safeParse([1, 2, 3]).success).toBe(true);
        expect(Vector3Schema.safeParse([1, 2]).success).toBe(false);
        expect(Vector3Schema.safeParse('not-a-vec').success).toBe(false);
    });

    it('validates hex colors', () => {
        expect(ColorSchema.safeParse('#ff00aa').success).toBe(true);
        expect(ColorSchema.safeParse('#FFFFFF').success).toBe(true);
        expect(ColorSchema.safeParse('red').success).toBe(false);
        expect(ColorSchema.safeParse('#gg0000').success).toBe(false);
        expect(ColorSchema.safeParse('#fff').success).toBe(false);
    });

    it('validates UUID strings', () => {
        expect(UUIDSchema.safeParse('abc-123').success).toBe(true);
        expect(UUIDSchema.safeParse('').success).toBe(false);
    });
});

describe('Actor Schemas', () => {
    it('validates a CharacterActor', () => {
        const result = CharacterActorSchema.safeParse(validCharacter);
        expect(result.success).toBe(true);
    });

    it('rejects invalid animation state', () => {
        const bad = { ...validCharacter, animation: 'flying' };
        expect(CharacterActorSchema.safeParse(bad).success).toBe(false);
    });

    it('validates morph target range 0-1', () => {
        const bad = { ...validCharacter, morphTargets: { mouthSmile: 2.0 } };
        expect(CharacterActorSchema.safeParse(bad).success).toBe(false);
    });

    it('validates a PrimitiveActor', () => {
        expect(PrimitiveActorSchema.safeParse(validPrimitive).success).toBe(true);
    });

    it('rejects invalid primitive shape', () => {
        const bad = {
            ...validPrimitive,
            properties: { ...validPrimitive.properties, shape: 'hexagon' },
        };
        expect(PrimitiveActorSchema.safeParse(bad).success).toBe(false);
    });

    it('validates a LightActor', () => {
        expect(LightActorSchema.safeParse(validLight).success).toBe(true);
    });

    it('validates a CameraActor', () => {
        expect(CameraActorSchema.safeParse(validCamera).success).toBe(true);
    });

    it('validates a SpeakerActor', () => {
        expect(SpeakerActorSchema.safeParse(validSpeaker).success).toBe(true);
    });

    it('discriminated union picks correct schema by type', () => {
        expect(ActorSchema.safeParse(validCharacter).success).toBe(true);
        expect(ActorSchema.safeParse(validPrimitive).success).toBe(true);
        expect(ActorSchema.safeParse(validCamera).success).toBe(true);
        // Invalid type
        expect(ActorSchema.safeParse({ ...validCamera, type: 'drone' }).success).toBe(false);
    });
});

describe('Scene Schemas', () => {
    it('validates Timeline', () => {
        const timeline = {
            duration: 30,
            cameraTrack: [
                {
                    id: 'cut-1',
                    time: 0,
                    cameraId: 'cam-001',
                    transition: 'cut',
                    transitionDuration: 0,
                },
            ],
            animationTracks: [],
        };
        expect(TimelineSchema.safeParse(timeline).success).toBe(true);
    });

    it('rejects zero-duration timeline', () => {
        expect(
            TimelineSchema.safeParse({ duration: 0, cameraTrack: [], animationTracks: [] }).success,
        ).toBe(false);
    });

    it('validates Environment', () => {
        const env = {
            ambientLight: { intensity: 0.5, color: '#ffffff' },
            sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
            skyColor: '#87ceeb',
            weather: { type: 'rain', intensity: 0.7 },
        };
        expect(EnvironmentSchema.safeParse(env).success).toBe(true);
    });

    it('validates ProjectMeta semver', () => {
        expect(ProjectMetaSchema.safeParse({ title: 'Test', version: '1.0.0' }).success).toBe(true);
        expect(ProjectMetaSchema.safeParse({ title: 'Test', version: 'v1' }).success).toBe(false);
    });

    it('validates full ProjectState', () => {
        const project = {
            meta: { title: 'Demo', version: '1.0.0' },
            environment: {
                ambientLight: { intensity: 0.5, color: '#ffffff' },
                sun: { position: [10, 10, 10], intensity: 1, color: '#ffffff' },
                skyColor: '#87ceeb',
            },
            actors: [validCamera, validPrimitive],
            timeline: { duration: 10, cameraTrack: [], animationTracks: [] },
            library: { clips: [] },
        };
        expect(ProjectStateSchema.safeParse(project).success).toBe(true);
    });
});
