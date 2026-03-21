/**
 * EyeController — Controls eye blink cycle, look-at targeting, and pupil dilation.
 * Works with both morph targets (GLB) and bone rotation (procedural).
 */
import * as THREE from 'three'
import type { BlendShapeValues } from './FaceMorphController'

export interface EyeState {
    blinkLeft: number
    blinkRight: number
    lookX: number  // -1 = left, 0 = center, 1 = right
    lookY: number  // -1 = down, 0 = center, 1 = up
    pupilDilation: number // 0 = constricted, 1 = dilated
}

export class EyeController {
    private state: EyeState = {
        blinkLeft: 0,
        blinkRight: 0,
        lookX: 0,
        lookY: 0,
        pupilDilation: 0.5,
    }

    // Blink timing
    private blinkTimer = 0
    private blinkInterval = 3.5 // seconds between blinks
    private blinkDuration = 0.15 // how long a blink takes
    private isBlinking = false
    private blinkProgress = 0

    // Look-at
    private lookTarget: THREE.Vector3 | null = null
    private lookSmoothing = 4.0

    /**
     * Set a world-space position for the eyes to look at.
     */
    setLookTarget(target: THREE.Vector3 | null): void {
        this.lookTarget = target
    }

    /**
     * Force a blink.
     */
    triggerBlink(): void {
        this.isBlinking = true
        this.blinkProgress = 0
    }

    /**
     * Set random blink interval range.
     */
    setBlinkRate(minInterval: number, maxInterval: number): void {
        this.blinkInterval = minInterval + Math.random() * (maxInterval - minInterval)
    }

    /**
     * Update (call every frame). Returns morph target values to apply.
     */
    update(delta: number, headWorldPosition?: THREE.Vector3): BlendShapeValues {
        const result: BlendShapeValues = {}

        // === Auto-blink ===
        this.blinkTimer += delta

        if (!this.isBlinking && this.blinkTimer >= this.blinkInterval) {
            this.isBlinking = true
            this.blinkProgress = 0
            this.blinkTimer = 0
            // Randomize next blink
            this.blinkInterval = 2.5 + Math.random() * 4.0
        }

        if (this.isBlinking) {
            this.blinkProgress += delta / this.blinkDuration

            if (this.blinkProgress >= 1) {
                this.isBlinking = false
                this.blinkProgress = 0
                this.state.blinkLeft = 0
                this.state.blinkRight = 0
            } else {
                // Smooth blink curve: fast close, slow open
                const t = this.blinkProgress
                const blinkValue = t < 0.4
                    ? t / 0.4 // fast close
                    : 1 - (t - 0.4) / 0.6 // slow open
                this.state.blinkLeft = blinkValue
                this.state.blinkRight = blinkValue
            }
        }

        result.eyeBlinkLeft = this.state.blinkLeft
        result.eyeBlinkRight = this.state.blinkRight

        // === Look-at ===
        if (this.lookTarget && headWorldPosition) {
            const dir = new THREE.Vector3()
                .subVectors(this.lookTarget, headWorldPosition)
                .normalize()

            // Map direction to eye morph target values
            const targetX = THREE.MathUtils.clamp(dir.x, -1, 1)
            const targetY = THREE.MathUtils.clamp(dir.y, -1, 1)

            this.state.lookX += (targetX - this.state.lookX) * this.lookSmoothing * delta
            this.state.lookY += (targetY - this.state.lookY) * this.lookSmoothing * delta

            // Convert to morph target values
            if (this.state.lookX > 0) {
                result.eyeLookOutLeft = this.state.lookX * 0.5
                result.eyeLookOutRight = this.state.lookX * 0.5
            } else {
                result.eyeLookInLeft = -this.state.lookX * 0.5
                result.eyeLookInRight = -this.state.lookX * 0.5
            }

            if (this.state.lookY > 0) {
                result.eyeLookUpLeft = this.state.lookY * 0.5
                result.eyeLookUpRight = this.state.lookY * 0.5
            } else {
                result.eyeLookDownLeft = -this.state.lookY * 0.5
                result.eyeLookDownRight = -this.state.lookY * 0.5
            }
        }

        return result
    }

    /**
     * Get current eye state.
     */
    getState(): EyeState {
        return { ...this.state }
    }
}
