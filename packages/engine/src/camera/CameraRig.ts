/**
 * CameraRig — Named camera movements for cinematography.
 * Provides dolly, truck, pedestal, crane, orbit, and pushIn operations.
 * Uses smooth animation via requestAnimationFrame.
 */
import * as THREE from 'three'

export type CameraMovement = 'dolly' | 'truck' | 'pedestal' | 'crane' | 'orbit' | 'pushIn'

interface MoveOptions {
    /** Duration in seconds. */
    duration?: number
    /** Easing function. */
    easing?: (t: number) => number
}

const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/**
 * CameraRig — Provides named camera movements for cinematography.
 */
export class CameraRig {
    private camera: THREE.PerspectiveCamera
    private target: THREE.Vector3
    private isAnimating = false

    constructor(camera: THREE.PerspectiveCamera, target?: THREE.Vector3) {
        this.camera = camera
        this.target = target || new THREE.Vector3(0, 0, 0)
    }

    /** Set the look-at target. */
    setTarget(target: THREE.Vector3): void {
        this.target.copy(target)
    }

    /** Whether an animation is currently in progress. */
    get animating(): boolean {
        return this.isAnimating
    }

    /**
     * Dolly — Move camera forward/back along its Z axis.
     * Positive = closer to subject, negative = further away.
     */
    dolly(distance: number, opts?: MoveOptions): Promise<void> {
        const dir = new THREE.Vector3()
        this.camera.getWorldDirection(dir)
        const end = this.camera.position.clone().add(dir.multiplyScalar(distance))
        return this._animateTo(end, opts)
    }

    /**
     * Truck — Move camera left/right along its X axis.
     * Positive = right, negative = left.
     */
    truck(distance: number, opts?: MoveOptions): Promise<void> {
        const right = new THREE.Vector3()
        right.crossVectors(
            new THREE.Vector3().subVectors(this.target, this.camera.position).normalize(),
            this.camera.up,
        ).normalize()
        const end = this.camera.position.clone().add(right.multiplyScalar(distance))
        return this._animateTo(end, opts)
    }

    /**
     * Pedestal — Move camera up/down along its Y axis.
     * Positive = up, negative = down.
     */
    pedestal(distance: number, opts?: MoveOptions): Promise<void> {
        const end = this.camera.position.clone()
        end.y += distance
        return this._animateTo(end, opts)
    }

    /**
     * Crane — Arc movement: simultaneous height change + orbit.
     * Simulates a camera crane lifting and swinging.
     */
    crane(heightDelta: number, arcAngle: number, opts?: MoveOptions): Promise<void> {
        const duration = opts?.duration ?? 2
        const easing = opts?.easing ?? easeInOutCubic
        const startPos = this.camera.position.clone()
        const startAngle = Math.atan2(
            startPos.x - this.target.x,
            startPos.z - this.target.z,
        )
        const radius = new THREE.Vector2(
            startPos.x - this.target.x,
            startPos.z - this.target.z,
        ).length()

        return this._animate(duration, easing, (t) => {
            const angle = startAngle + arcAngle * t
            const height = startPos.y + heightDelta * t
            this.camera.position.set(
                this.target.x + Math.sin(angle) * radius,
                height,
                this.target.z + Math.cos(angle) * radius,
            )
            this.camera.lookAt(this.target)
        })
    }

    /**
     * Orbit — Circular path around the target at constant radius.
     */
    orbit(angle: number, opts?: MoveOptions): Promise<void> {
        return this.crane(0, angle, opts)
    }

    /**
     * Push In — Dramatic move towards a subject.
     * Camera moves from current position to `endDistance` from target.
     */
    pushIn(endDistance: number, opts?: MoveOptions): Promise<void> {
        const duration = opts?.duration ?? 1.5
        const easing = opts?.easing ?? easeInOutCubic
        const startPos = this.camera.position.clone()
        const dir = new THREE.Vector3().subVectors(this.target, startPos).normalize()
        const startDistance = startPos.distanceTo(this.target)

        return this._animate(duration, easing, (t) => {
            const currentDist = startDistance + (endDistance - startDistance) * t
            this.camera.position.copy(this.target).add(dir.clone().multiplyScalar(-currentDist))
            this.camera.lookAt(this.target)
        })
    }

    // ---- Internal animation helpers ----

    private _animateTo(endPos: THREE.Vector3, opts?: MoveOptions): Promise<void> {
        const duration = opts?.duration ?? 1
        const easing = opts?.easing ?? easeInOutCubic
        const startPos = this.camera.position.clone()

        return this._animate(duration, easing, (t) => {
            this.camera.position.lerpVectors(startPos, endPos, t)
            this.camera.lookAt(this.target)
        })
    }

    private _animate(
        duration: number,
        easing: (t: number) => number,
        update: (t: number) => void,
    ): Promise<void> {
        return new Promise((resolve) => {
            if (this.isAnimating) {
                resolve()
                return
            }

            this.isAnimating = true
            const startTime = performance.now()

            const tick = () => {
                const elapsed = (performance.now() - startTime) / 1000
                const linear = Math.min(elapsed / duration, 1)
                const eased = easing(linear)

                update(eased)

                if (linear < 1) {
                    requestAnimationFrame(tick)
                } else {
                    this.isAnimating = false
                    resolve()
                }
            }

            requestAnimationFrame(tick)
        })
    }
}

/**
 * Predefined camera movement sequences for common cinematography shots.
 */
export const CAMERA_SHOTS = {
    /** Classic establishing shot — high crane down + orbit. */
    establishing: async (rig: CameraRig) => {
        await rig.crane(-3, Math.PI * 0.5, { duration: 3 })
    },
    /** Dramatic push-in on the subject. */
    dramaticPushIn: async (rig: CameraRig) => {
        await rig.pushIn(2, { duration: 2 })
    },
    /** 360° orbit around subject. */
    fullOrbit: async (rig: CameraRig) => {
        await rig.orbit(Math.PI * 2, { duration: 6 })
    },
    /** Reveal shot — truck right to reveal scene. */
    reveal: async (rig: CameraRig) => {
        await rig.truck(5, { duration: 3 })
    },
    /** Crane up — bird's eye reveal. */
    birdsEye: async (rig: CameraRig) => {
        await rig.crane(8, Math.PI * 0.25, { duration: 4 })
    },
} as const
