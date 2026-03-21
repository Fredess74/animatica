/**
 * FaceMorphController — Controls facial expressions via morph targets.
 * Supports 52 ARKit-standard blend shapes and expression presets.
 */
import * as THREE from 'three'

/**
 * ARKit-standard blend shape names.
 * Maps to morph target indices on the head mesh.
 */
export const BLEND_SHAPES = [
    // Brows (5)
    'browDownLeft', 'browDownRight', 'browInnerUp', 'browOuterUpLeft', 'browOuterUpRight',
    // Eyes (14)
    'eyeBlinkLeft', 'eyeBlinkRight', 'eyeLookDownLeft', 'eyeLookDownRight',
    'eyeLookInLeft', 'eyeLookInRight', 'eyeLookOutLeft', 'eyeLookOutRight',
    'eyeLookUpLeft', 'eyeLookUpRight', 'eyeSquintLeft', 'eyeSquintRight',
    'eyeWideLeft', 'eyeWideRight',
    // Cheeks (3)
    'cheekPuff', 'cheekSquintLeft', 'cheekSquintRight',
    // Mouth (19)
    'jawForward', 'jawLeft', 'jawRight', 'jawOpen',
    'mouthClose', 'mouthFunnel', 'mouthPucker',
    'mouthLeft', 'mouthRight',
    'mouthSmileLeft', 'mouthSmileRight',
    'mouthFrownLeft', 'mouthFrownRight',
    'mouthDimpleLeft', 'mouthDimpleRight',
    'mouthStretchLeft', 'mouthStretchRight',
    'mouthPressLeft', 'mouthPressRight',
    // Lips (6)
    'mouthUpperUpLeft', 'mouthUpperUpRight',
    'mouthLowerDownLeft', 'mouthLowerDownRight',
    'mouthShrugUpper', 'mouthShrugLower',
    // Tongue (1)
    'tongueOut',
    // Nose (2)
    'noseSneerLeft', 'noseSneerRight',
] as const

export type BlendShapeName = typeof BLEND_SHAPES[number]
export type BlendShapeValues = Partial<Record<BlendShapeName, number>>

/**
 * Expression presets — each is a combination of blend shape values.
 */
export const EXPRESSION_PRESETS: Record<string, BlendShapeValues> = {
    neutral: {},

    happy: {
        mouthSmileLeft: 0.8,
        mouthSmileRight: 0.8,
        eyeSquintLeft: 0.3,
        eyeSquintRight: 0.3,
        cheekSquintLeft: 0.4,
        cheekSquintRight: 0.4,
    },

    sad: {
        browInnerUp: 0.5,
        mouthFrownLeft: 0.6,
        mouthFrownRight: 0.6,
        eyeSquintLeft: 0.2,
        eyeSquintRight: 0.2,
        mouthPucker: 0.15,
    },

    angry: {
        browDownLeft: 0.7,
        browDownRight: 0.7,
        jawOpen: 0.15,
        mouthFrownLeft: 0.5,
        mouthFrownRight: 0.5,
        noseSneerLeft: 0.4,
        noseSneerRight: 0.4,
        eyeSquintLeft: 0.5,
        eyeSquintRight: 0.5,
    },

    surprised: {
        browInnerUp: 0.9,
        browOuterUpLeft: 0.6,
        browOuterUpRight: 0.6,
        eyeWideLeft: 0.8,
        eyeWideRight: 0.8,
        jawOpen: 0.6,
        mouthFunnel: 0.3,
    },

    thinking: {
        browOuterUpLeft: 0.6,
        eyeSquintRight: 0.3,
        mouthLeft: 0.3,
        eyeLookUpLeft: 0.4,
    },

    wink: {
        eyeBlinkRight: 1.0,
        mouthSmileLeft: 0.4,
        mouthSmileRight: 0.2,
    },

    sleeping: {
        eyeBlinkLeft: 1.0,
        eyeBlinkRight: 1.0,
        jawOpen: 0.15,
        mouthClose: 0.3,
    },

    talking: {
        jawOpen: 0.3,
        mouthFunnel: 0.1,
    },

    cool: {
        eyeSquintLeft: 0.5,
        eyeSquintRight: 0.5,
        mouthSmileLeft: 0.3,
        mouthSmileRight: 0.3,
        browDownLeft: 0.2,
        browDownRight: 0.2,
    },
}

/**
 * Controller for applying morph target values to a character's head mesh.
 */
export class FaceMorphController {
    private mesh: THREE.SkinnedMesh | null
    private morphMap: Record<string, number>
    private currentValues: BlendShapeValues = {}
    private targetValues: BlendShapeValues = {}
    private blendSpeed: number = 5.0 // units per second

    constructor(mesh: THREE.SkinnedMesh | null, morphMap: Record<string, number> = {}) {
        this.mesh = mesh
        this.morphMap = morphMap
    }

    /**
     * Set blend shape values directly (immediate).
     */
    setImmediate(values: BlendShapeValues): void {
        if (!this.mesh?.morphTargetInfluences) return

        for (const [name, value] of Object.entries(values)) {
            const idx = this.morphMap[name]
            if (idx !== undefined && value !== undefined) {
                this.mesh.morphTargetInfluences[idx] = value
                this.currentValues[name as BlendShapeName] = value
            }
        }
    }

    /**
     * Set target blend shape values (will lerp smoothly).
     */
    setTarget(values: BlendShapeValues): void {
        this.targetValues = { ...values }
    }

    /**
     * Apply a named expression preset.
     */
    setExpression(presetName: string, immediate = false): void {
        const preset = EXPRESSION_PRESETS[presetName]
        if (!preset) {
            console.warn(`[FaceMorphController] Unknown expression: ${presetName}`)
            return
        }

        // Reset all to 0, then apply preset
        const fullValues: BlendShapeValues = {}
        for (const name of BLEND_SHAPES) {
            fullValues[name] = preset[name] ?? 0
        }

        if (immediate) {
            this.setImmediate(fullValues)
        } else {
            this.setTarget(fullValues)
        }
    }

    /**
     * Update (call every frame for smooth blending).
     */
    update(delta: number): void {
        if (!this.mesh?.morphTargetInfluences) return

        const step = this.blendSpeed * delta

        for (const [name, target] of Object.entries(this.targetValues)) {
            const idx = this.morphMap[name]
            if (idx === undefined || target === undefined) continue

            const current = this.currentValues[name as BlendShapeName] ?? 0
            const diff = target - current

            if (Math.abs(diff) < 0.001) {
                this.mesh.morphTargetInfluences[idx] = target
                this.currentValues[name as BlendShapeName] = target
            } else {
                const newValue = current + diff * Math.min(step, 1)
                this.mesh.morphTargetInfluences[idx] = newValue
                this.currentValues[name as BlendShapeName] = newValue
            }
        }
    }

    /**
     * Reset all morph targets to 0.
     */
    reset(): void {
        if (!this.mesh?.morphTargetInfluences) return

        for (let i = 0; i < this.mesh.morphTargetInfluences.length; i++) {
            this.mesh.morphTargetInfluences[i] = 0
        }

        this.currentValues = {}
        this.targetValues = {}
    }

    /**
     * Get current blend shape values.
     */
    getValues(): BlendShapeValues {
        return { ...this.currentValues }
    }
}

/**
 * Viseme map for lip-sync.
 * Maps phoneme categories to morph target values.
 */
export const VISEME_MAP: Record<string, BlendShapeValues> = {
    REST: {},
    A: { jawOpen: 0.7 },
    E: { jawOpen: 0.3, mouthSmileLeft: 0.4, mouthSmileRight: 0.4 },
    I: { jawOpen: 0.2, mouthSmileLeft: 0.3, mouthSmileRight: 0.3 },
    O: { jawOpen: 0.5, mouthFunnel: 0.6 },
    U: { jawOpen: 0.2, mouthPucker: 0.7 },
    F: { mouthUpperUpLeft: 0.3, mouthLowerDownLeft: 0.2 },
    M: { mouthClose: 0.8 },
    L: { jawOpen: 0.3, tongueOut: 0.2 },
    TH: { jawOpen: 0.2, tongueOut: 0.4 },
}
