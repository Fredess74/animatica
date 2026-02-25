import { describe, it, expectTypeOf } from 'vitest';
import { z } from 'zod';
import * as Types from '../types';
import * as Schemas from './index';

// Helper to make type names shorter
type Infer<T extends z.ZodTypeAny> = z.infer<T>;

describe('Type Parity', () => {
    // ---- Primitives ----
    it('matches Vector3', () => {
        expectTypeOf<Infer<typeof Schemas.Vector3Schema>>().toEqualTypeOf<Types.Vector3>();
    });
    it('matches Color', () => {
        expectTypeOf<Infer<typeof Schemas.ColorSchema>>().toEqualTypeOf<Types.Color>();
    });
    it('matches UUID', () => {
        expectTypeOf<Infer<typeof Schemas.UUIDSchema>>().toEqualTypeOf<Types.UUID>();
    });

    // ---- Transform ----
    it('matches Transform', () => {
        expectTypeOf<Infer<typeof Schemas.TransformSchema>>().toEqualTypeOf<Types.Transform>();
    });

    // ---- Base Actor ----
    it('matches BaseActor', () => {
        expectTypeOf<Infer<typeof Schemas.BaseActorSchema>>().toEqualTypeOf<Types.BaseActor>();
    });

    // ---- Character ----
    it('matches AnimationState', () => {
        expectTypeOf<Infer<typeof Schemas.AnimationStateSchema>>().toEqualTypeOf<Types.AnimationState>();
    });
    it('matches MorphTargets', () => {
        expectTypeOf<Infer<typeof Schemas.MorphTargetsSchema>>().toEqualTypeOf<Types.MorphTargets>();
    });
    it('matches BodyPose', () => {
        expectTypeOf<Infer<typeof Schemas.BodyPoseSchema>>().toEqualTypeOf<Types.BodyPose>();
    });
    it('matches ClothingItem', () => {
        expectTypeOf<Infer<typeof Schemas.ClothingItemSchema>>().toEqualTypeOf<Types.ClothingItem>();
    });
    it('matches ClothingSlots', () => {
        expectTypeOf<Infer<typeof Schemas.ClothingSlotsSchema>>().toEqualTypeOf<Types.ClothingSlots>();
    });
    it('matches CharacterActor', () => {
        expectTypeOf<Infer<typeof Schemas.CharacterActorSchema>>().toEqualTypeOf<Types.CharacterActor>();
    });

    // ---- Primitive ----
    it('matches PrimitiveShape', () => {
        expectTypeOf<Infer<typeof Schemas.PrimitiveShapeSchema>>().toEqualTypeOf<Types.PrimitiveShape>();
    });
    it('matches PrimitiveActor', () => {
        expectTypeOf<Infer<typeof Schemas.PrimitiveActorSchema>>().toEqualTypeOf<Types.PrimitiveActor>();
    });

    // ---- Light ----
    it('matches LightType', () => {
        expectTypeOf<Infer<typeof Schemas.LightTypeSchema>>().toEqualTypeOf<Types.LightType>();
    });
    it('matches LightActor', () => {
        expectTypeOf<Infer<typeof Schemas.LightActorSchema>>().toEqualTypeOf<Types.LightActor>();
    });

    // ---- Camera ----
    it('matches CameraActor', () => {
        expectTypeOf<Infer<typeof Schemas.CameraActorSchema>>().toEqualTypeOf<Types.CameraActor>();
    });

    // ---- Speaker ----
    it('matches SpeakerActor', () => {
        expectTypeOf<Infer<typeof Schemas.SpeakerActorSchema>>().toEqualTypeOf<Types.SpeakerActor>();
    });

    // ---- Union ----
    it('matches Actor Union', () => {
        expectTypeOf<Infer<typeof Schemas.ActorSchema>>().toEqualTypeOf<Types.Actor>();
    });

    // ---- Timeline ----
    it('matches EasingType', () => {
        expectTypeOf<Infer<typeof Schemas.EasingTypeSchema>>().toEqualTypeOf<Types.EasingType>();
    });
    it('matches Keyframe', () => {
        expectTypeOf<Infer<typeof Schemas.KeyframeSchema>>().toEqualTypeOf<Types.Keyframe>();
    });
    it('matches AnimationTrack', () => {
        expectTypeOf<Infer<typeof Schemas.AnimationTrackSchema>>().toEqualTypeOf<Types.AnimationTrack>();
    });
    it('matches TransitionType', () => {
        expectTypeOf<Infer<typeof Schemas.TransitionTypeSchema>>().toEqualTypeOf<Types.TransitionType>();
    });
    it('matches CameraCut', () => {
        expectTypeOf<Infer<typeof Schemas.CameraCutSchema>>().toEqualTypeOf<Types.CameraCut>();
    });
    it('matches Timeline', () => {
        expectTypeOf<Infer<typeof Schemas.TimelineSchema>>().toEqualTypeOf<Types.Timeline>();
    });

    // ---- Environment ----
    it('matches WeatherType', () => {
        expectTypeOf<Infer<typeof Schemas.WeatherTypeSchema>>().toEqualTypeOf<Types.WeatherType>();
    });
    it('matches Weather', () => {
        expectTypeOf<Infer<typeof Schemas.WeatherSchema>>().toEqualTypeOf<Types.Weather>();
    });
    it('matches Fog', () => {
        expectTypeOf<Infer<typeof Schemas.FogSchema>>().toEqualTypeOf<Types.Fog>();
    });
    it('matches Environment', () => {
        expectTypeOf<Infer<typeof Schemas.EnvironmentSchema>>().toEqualTypeOf<Types.Environment>();
    });

    // ---- Project ----
    it('matches ProjectMeta', () => {
        expectTypeOf<Infer<typeof Schemas.ProjectMetaSchema>>().toEqualTypeOf<Types.ProjectMeta>();
    });
    it('matches ProjectState', () => {
        expectTypeOf<Infer<typeof Schemas.ProjectStateSchema>>().toEqualTypeOf<Types.ProjectState>();
    });
});
