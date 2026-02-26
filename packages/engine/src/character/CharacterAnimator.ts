/**
 * CharacterAnimator — Animation state machine with crossfade blending.
 * Wraps THREE.AnimationMixer with high-level play/stop/crossfade API.
 */
import * as THREE from 'three'

export type AnimState = 'idle' | 'walk' | 'run' | 'talk' | 'wave' | 'dance' | 'sit' | 'jump'

export interface AnimationTransition {
    from: AnimState
    to: AnimState
    duration: number // crossfade seconds
}

/**
 * Default crossfade durations between states.
 */
const DEFAULT_TRANSITIONS: AnimationTransition[] = [
    { from: 'idle', to: 'walk', duration: 0.3 },
    { from: 'walk', to: 'idle', duration: 0.3 },
    { from: 'walk', to: 'run', duration: 0.2 },
    { from: 'run', to: 'walk', duration: 0.3 },
    { from: 'idle', to: 'talk', duration: 0.25 },
    { from: 'talk', to: 'idle', duration: 0.3 },
    { from: 'idle', to: 'wave', duration: 0.2 },
    { from: 'idle', to: 'dance', duration: 0.3 },
    { from: 'idle', to: 'sit', duration: 0.5 },
    { from: 'idle', to: 'jump', duration: 0.15 },
]

export class CharacterAnimator {
    private mixer: THREE.AnimationMixer
    private actions: Map<AnimState, THREE.AnimationAction> = new Map()
    private currentState: AnimState | null = null
    private currentAction: THREE.AnimationAction | null = null
    private transitions: AnimationTransition[]
    private speed: number = 1.0

    constructor(root: THREE.Object3D, transitions?: AnimationTransition[]) {
        this.mixer = new THREE.AnimationMixer(root)
        this.transitions = transitions || DEFAULT_TRANSITIONS
    }

    /**
     * Register an animation clip for a state.
     */
    registerClip(state: AnimState, clip: THREE.AnimationClip): void {
        const action = this.mixer.clipAction(clip)
        action.setEffectiveWeight(0)
        this.actions.set(state, action)
    }

    /**
     * Register a procedural animation (generated from code, not a clip).
     */
    registerProceduralClip(state: AnimState, generator: () => THREE.AnimationClip): void {
        const clip = generator()
        this.registerClip(state, clip)
    }

    /**
     * Play an animation state with crossfade blending.
     */
    play(state: AnimState): void {
        if (state === this.currentState) return

        const nextAction = this.actions.get(state)
        if (!nextAction) {
            console.warn(`[CharacterAnimator] No clip registered for state: ${state}`)
            return
        }

        // Determine crossfade duration
        const transition = this.transitions.find(
            (t) => t.from === this.currentState && t.to === state
        )
        const fadeDuration = transition?.duration ?? 0.3

        // Crossfade
        if (this.currentAction) {
            nextAction.reset()
            nextAction.setEffectiveWeight(1)
            nextAction.setEffectiveTimeScale(this.speed)
            nextAction.play()
            this.currentAction.crossFadeTo(nextAction, fadeDuration, true)
        } else {
            nextAction.reset()
            nextAction.setEffectiveWeight(1)
            nextAction.setEffectiveTimeScale(this.speed)
            nextAction.play()
        }

        this.currentState = state
        this.currentAction = nextAction
    }

    /**
     * Stop all animations.
     */
    stop(): void {
        this.mixer.stopAllAction()
        this.currentState = null
        this.currentAction = null
    }

    /**
     * Set playback speed.
     */
    setSpeed(speed: number): void {
        this.speed = speed
        if (this.currentAction) {
            this.currentAction.setEffectiveTimeScale(speed)
        }
    }

    /**
     * Get current animation state.
     */
    getState(): AnimState | null {
        return this.currentState
    }

    /**
     * Must be called every frame.
     */
    update(delta: number): void {
        this.mixer.update(delta)
    }

    /**
     * Cleanup.
     */
    dispose(): void {
        this.mixer.stopAllAction()
        this.actions.clear()
    }
}

// ===============================
// Procedural Animation Generators
// ===============================

/**
 * Generate a procedural idle animation clip.
 * Subtle breathing + weight shift.
 */
export function createIdleClip(duration = 4): THREE.AnimationClip {
    const fps = 30
    const frames = duration * fps
    const times: number[] = []
    const spineRotations: number[] = []
    const headRotations: number[] = []
    const hipsPositions: number[] = []

    for (let i = 0; i <= frames; i++) {
        const t = i / fps
        times.push(t)

        // Subtle spine breathing
        const breathPhase = Math.sin(t * Math.PI * 0.8) * 0.01
        spineRotations.push(breathPhase, 0, 0, 1) // quaternion xyzw

        // Subtle head movement
        const headSway = Math.sin(t * Math.PI * 0.3) * 0.015
        headRotations.push(0, headSway, 0, 1)

        // Subtle hip sway
        const hipSway = Math.sin(t * Math.PI * 0.5) * 0.005
        hipsPositions.push(hipSway, 0.55 + breathPhase * 0.5, 0)
    }

    const tracks = [
        new THREE.QuaternionKeyframeTrack('Spine.quaternion', times, spineRotations),
        new THREE.QuaternionKeyframeTrack('Head.quaternion', times, headRotations),
        new THREE.VectorKeyframeTrack('Hips.position', times, hipsPositions),
    ]

    const clip = new THREE.AnimationClip('idle', duration, tracks)
    clip.optimize()
    return clip
}

/**
 * Generate a procedural walk animation clip.
 * Hip sway + arm swing + step bounce.
 */
export function createWalkClip(duration = 1.2): THREE.AnimationClip {
    const fps = 30
    const frames = duration * fps
    const times: number[] = []
    const hipsPositions: number[] = []
    const leftUpperLegRots: number[] = []
    const rightUpperLegRots: number[] = []
    const leftArmRots: number[] = []
    const rightArmRots: number[] = []

    for (let i = 0; i <= frames; i++) {
        const t = i / fps
        const phase = (t / duration) * Math.PI * 2
        times.push(t)

        // Hip bounce
        const bounce = Math.abs(Math.sin(phase)) * 0.02
        const hipSway = Math.sin(phase) * 0.015
        hipsPositions.push(hipSway, 0.55 + bounce, 0)

        // Legs (opposite phase)
        const legSwing = Math.sin(phase) * 0.4
        leftUpperLegRots.push(legSwing, 0, 0, 1)
        rightUpperLegRots.push(-legSwing, 0, 0, 1)

        // Arms (counter to legs)
        const armSwing = Math.sin(phase) * 0.3
        leftArmRots.push(-armSwing, 0, 0, 1)
        rightArmRots.push(armSwing, 0, 0, 1)
    }

    const tracks = [
        new THREE.VectorKeyframeTrack('Hips.position', times, hipsPositions),
        new THREE.QuaternionKeyframeTrack('LeftUpperLeg.quaternion', times, leftUpperLegRots),
        new THREE.QuaternionKeyframeTrack('RightUpperLeg.quaternion', times, rightUpperLegRots),
        new THREE.QuaternionKeyframeTrack('LeftArm.quaternion', times, leftArmRots),
        new THREE.QuaternionKeyframeTrack('RightArm.quaternion', times, rightArmRots),
    ]

    const clip = new THREE.AnimationClip('walk', duration, tracks)
    clip.optimize()
    return clip
}
