/**
 * @module @Animatica/engine/character
 * Barrel export for the character system.
 */
export { extractRig, createProceduralHumanoid, HUMANOID_BONES } from './CharacterLoader'
export type { CharacterRig, HumanoidBoneName } from './CharacterLoader'

export { CharacterAnimator, createIdleClip, createWalkClip, createRunClip, createTalkClip, createWaveClip, createDanceClip, createSitClip, createJumpClip } from './CharacterAnimator'
export type { AnimState, AnimationTransition } from './CharacterAnimator'

export { FaceMorphController, BLEND_SHAPES, EXPRESSION_PRESETS, VISEME_MAP } from './FaceMorphController'
export type { BlendShapeName, BlendShapeValues } from './FaceMorphController'

export { EyeController } from './EyeController'
export type { EyeState } from './EyeController'

export { CHARACTER_PRESETS, getPreset, getPresetIds } from './CharacterPresets'
export type { CharacterPreset } from './CharacterPresets'

