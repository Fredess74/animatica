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

/**
 * Procedural run clip — faster walk with more pronounced movements.
 */
export function createRunClip(duration = 0.8): THREE.AnimationClip {
    const fps = 30
    const frames = duration * fps
    const times: number[] = []
    const hipsPositions: number[] = []
    const leftUpperLegRots: number[] = []
    const rightUpperLegRots: number[] = []
    const leftArmRots: number[] = []
    const rightArmRots: number[] = []
    const chestRots: number[] = []

    for (let i = 0; i <= frames; i++) {
        const t = i / fps
        const phase = (t / duration) * Math.PI * 2
        times.push(t)

        const bounce = Math.abs(Math.sin(phase)) * 0.04
        const hipSway = Math.sin(phase) * 0.02
        hipsPositions.push(hipSway, 0.58 + bounce, 0)

        const legSwing = Math.sin(phase) * 0.6
        leftUpperLegRots.push(legSwing, 0, 0, 1)
        rightUpperLegRots.push(-legSwing, 0, 0, 1)

        const armSwing = Math.sin(phase) * 0.5
        leftArmRots.push(-armSwing, 0, 0, 1)
        rightArmRots.push(armSwing, 0, 0, 1)

        // Slight forward lean
        chestRots.push(0.1, 0, 0, 1)
    }

    const tracks = [
        new THREE.VectorKeyframeTrack('Hips.position', times, hipsPositions),
        new THREE.QuaternionKeyframeTrack('LeftUpperLeg.quaternion', times, leftUpperLegRots),
        new THREE.QuaternionKeyframeTrack('RightUpperLeg.quaternion', times, rightUpperLegRots),
        new THREE.QuaternionKeyframeTrack('LeftArm.quaternion', times, leftArmRots),
        new THREE.QuaternionKeyframeTrack('RightArm.quaternion', times, rightArmRots),
        new THREE.QuaternionKeyframeTrack('Chest.quaternion', times, chestRots),
    ]

    const clip = new THREE.AnimationClip('run', duration, tracks)
    clip.optimize()
    return clip
}

/**
 * Procedural talk clip — jaw movement + hand gestures.
 */
export function createTalkClip(duration = 2.0): THREE.AnimationClip {
    const fps = 30
    const frames = duration * fps
    const times: number[] = []
    const headRots: number[] = []
    const rightArmRots: number[] = []
    const rightForeArmRots: number[] = []
    const spineRots: number[] = []

    for (let i = 0; i <= frames; i++) {
        const t = i / fps
        times.push(t)

        // Head nods while talking
        const headNod = Math.sin(t * Math.PI * 2.5) * 0.04
        const headTilt = Math.sin(t * Math.PI * 1.2) * 0.03
        headRots.push(headNod, headTilt, 0, 1)

        // Right hand gesture
        const gesture = Math.sin(t * Math.PI * 1.5) * 0.15
        rightArmRots.push(-0.3 + gesture, 0, -0.2, 1)
        rightForeArmRots.push(-0.5 + gesture * 0.5, 0, 0, 1)

        // Subtle body sway
        const sway = Math.sin(t * Math.PI * 0.7) * 0.02
        spineRots.push(sway, 0, 0, 1)
    }

    const tracks = [
        new THREE.QuaternionKeyframeTrack('Head.quaternion', times, headRots),
        new THREE.QuaternionKeyframeTrack('RightArm.quaternion', times, rightArmRots),
        new THREE.QuaternionKeyframeTrack('RightForeArm.quaternion', times, rightForeArmRots),
        new THREE.QuaternionKeyframeTrack('Spine.quaternion', times, spineRots),
    ]

    const clip = new THREE.AnimationClip('talk', duration, tracks)
    clip.optimize()
    return clip
}

/**
 * Procedural wave clip — right hand wave.
 */
export function createWaveClip(duration = 2.0): THREE.AnimationClip {
    const fps = 30
    const frames = duration * fps
    const times: number[] = []
    const rightArmRots: number[] = []
    const rightForeArmRots: number[] = []
    const rightHandRots: number[] = []

    for (let i = 0; i <= frames; i++) {
        const t = i / fps
        times.push(t)

        // Raise arm
        const raise = Math.min(t / 0.3, 1) // quick raise in 0.3s
        rightArmRots.push(0, 0, -1.4 * raise, 1) // arm up

        // Wave forearm
        const wave = Math.sin(t * Math.PI * 4) * 0.4 * raise
        rightForeArmRots.push(0, wave, -0.3 * raise, 1)

        // Wave hand
        const handWave = Math.sin(t * Math.PI * 6) * 0.3 * raise
        rightHandRots.push(handWave, 0, 0, 1)
    }

    const tracks = [
        new THREE.QuaternionKeyframeTrack('RightArm.quaternion', times, rightArmRots),
        new THREE.QuaternionKeyframeTrack('RightForeArm.quaternion', times, rightForeArmRots),
        new THREE.QuaternionKeyframeTrack('RightHand.quaternion', times, rightHandRots),
    ]

    const clip = new THREE.AnimationClip('wave', duration, tracks)
    clip.optimize()
    return clip
}

/**
 * Procedural dance clip — hip sway + arm groove.
 */
export function createDanceClip(duration = 2.4): THREE.AnimationClip {
    const fps = 30
    const frames = duration * fps
    const times: number[] = []
    const hipsPositions: number[] = []
    const leftArmRots: number[] = []
    const rightArmRots: number[] = []
    const spineRots: number[] = []
    const headRots: number[] = []

    for (let i = 0; i <= frames; i++) {
        const t = i / fps
        const beat = (t / duration) * Math.PI * 4 // 2 beats per loop
        times.push(t)

        // Hip groove
        const hipBounce = Math.abs(Math.sin(beat)) * 0.04
        const hipSway = Math.sin(beat) * 0.04
        hipsPositions.push(hipSway, 0.52 + hipBounce, 0)

        // Arms pumping
        const armPump = Math.sin(beat) * 0.5
        leftArmRots.push(-0.3 + armPump, 0, 0.2, 1)
        rightArmRots.push(-0.3 - armPump, 0, -0.2, 1)

        // Body sway
        const sway = Math.sin(beat * 0.5) * 0.08
        spineRots.push(0, sway, 0, 1)

        // Head bob
        const bob = Math.sin(beat) * 0.06
        headRots.push(bob, 0, 0, 1)
    }

    const tracks = [
        new THREE.VectorKeyframeTrack('Hips.position', times, hipsPositions),
        new THREE.QuaternionKeyframeTrack('LeftArm.quaternion', times, leftArmRots),
        new THREE.QuaternionKeyframeTrack('RightArm.quaternion', times, rightArmRots),
        new THREE.QuaternionKeyframeTrack('Spine.quaternion', times, spineRots),
        new THREE.QuaternionKeyframeTrack('Head.quaternion', times, headRots),
    ]

    const clip = new THREE.AnimationClip('dance', duration, tracks)
    clip.optimize()
    return clip
}

/**
 * Procedural sit clip — legs bent, leaned back.
 */
export function createSitClip(duration = 0.8): THREE.AnimationClip {
    const fps = 30
    const frames = duration * fps
    const times: number[] = []
    const hipsPositions: number[] = []
    const leftUpperLegRots: number[] = []
    const rightUpperLegRots: number[] = []
    const leftLowerLegRots: number[] = []
    const rightLowerLegRots: number[] = []
    const spineRots: number[] = []

    for (let i = 0; i <= frames; i++) {
        const t = i / fps
        const progress = Math.min(t / 0.5, 1) // ease into sit
        const ease = 1 - Math.pow(1 - progress, 3) // easeOutCubic
        times.push(t)

        hipsPositions.push(0, 0.55 - ease * 0.25, ease * 0.05)

        // Bend legs 90 degrees
        leftUpperLegRots.push(-1.5 * ease, 0, 0, 1)
        rightUpperLegRots.push(-1.5 * ease, 0, 0, 1)
        leftLowerLegRots.push(1.5 * ease, 0, 0, 1)
        rightLowerLegRots.push(1.5 * ease, 0, 0, 1)

        // Lean back slightly
        spineRots.push(-0.15 * ease, 0, 0, 1)
    }

    const tracks = [
        new THREE.VectorKeyframeTrack('Hips.position', times, hipsPositions),
        new THREE.QuaternionKeyframeTrack('LeftUpperLeg.quaternion', times, leftUpperLegRots),
        new THREE.QuaternionKeyframeTrack('RightUpperLeg.quaternion', times, rightUpperLegRots),
        new THREE.QuaternionKeyframeTrack('LeftLowerLeg.quaternion', times, leftLowerLegRots),
        new THREE.QuaternionKeyframeTrack('RightLowerLeg.quaternion', times, rightLowerLegRots),
        new THREE.QuaternionKeyframeTrack('Spine.quaternion', times, spineRots),
    ]

    const clip = new THREE.AnimationClip('sit', duration, tracks)
    clip.optimize()
    return clip
}

/**
 * Procedural jump clip — squat → launch → airborne → land.
 */
export function createJumpClip(duration = 1.0): THREE.AnimationClip {
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
        const p = t / duration // 0→1
        times.push(t)

        let hipY: number
        if (p < 0.2) {
            // Squat phase
            hipY = 0.55 - (p / 0.2) * 0.1
        } else if (p < 0.5) {
            // Launch phase
            const launchP = (p - 0.2) / 0.3
            hipY = 0.45 + launchP * 0.35
        } else if (p < 0.8) {
            // Airborne
            const airP = (p - 0.5) / 0.3
            hipY = 0.8 - airP * 0.25
        } else {
            // Landing
            const landP = (p - 0.8) / 0.2
            hipY = 0.55
        }

        hipsPositions.push(0, hipY, 0)

        // Legs tuck in air
        const tuck = p > 0.3 && p < 0.7 ? Math.sin((p - 0.3) / 0.4 * Math.PI) * 0.6 : 0
        leftUpperLegRots.push(-tuck, 0, 0, 1)
        rightUpperLegRots.push(-tuck, 0, 0, 1)

        // Arms raise
        const armRaise = p > 0.2 && p < 0.7 ? Math.sin((p - 0.2) / 0.5 * Math.PI) * 0.8 : 0
        leftArmRots.push(0, 0, armRaise, 1)
        rightArmRots.push(0, 0, -armRaise, 1)
    }

    const tracks = [
        new THREE.VectorKeyframeTrack('Hips.position', times, hipsPositions),
        new THREE.QuaternionKeyframeTrack('LeftUpperLeg.quaternion', times, leftUpperLegRots),
        new THREE.QuaternionKeyframeTrack('RightUpperLeg.quaternion', times, rightUpperLegRots),
        new THREE.QuaternionKeyframeTrack('LeftArm.quaternion', times, leftArmRots),
        new THREE.QuaternionKeyframeTrack('RightArm.quaternion', times, rightArmRots),
    ]

    const clip = new THREE.AnimationClip('jump', duration, tracks)
    clip.optimize()
    return clip
}
