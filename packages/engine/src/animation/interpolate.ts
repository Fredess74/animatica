/**
 * Keyframe interpolation engine.
 * Interpolates between keyframes using easing functions for any property type.
 *
 * Supports: number, Vector3 ([x,y,z]), Color (hex string), boolean (step).
 *
 * @module @animatica/engine/animation/interpolate
 */
import type { Keyframe, EasingType, Vector3 } from '../types';
import * as Easing from './easing';

// ---- Easing resolver ----

const EASING_MAP: Record<EasingType, (t: number) => number> = {
    linear: Easing.linear,
    step: Easing.step,
    easeIn: Easing.easeIn,
    easeOut: Easing.easeOut,
    easeInOut: Easing.easeInOut,
    backIn: Easing.backIn,
    backOut: Easing.backOut,
    backInOut: Easing.backInOut,
    bounceIn: Easing.bounceIn,
    bounceOut: Easing.bounceOut,
    bounceInOut: Easing.bounceInOut,
    elasticIn: Easing.elasticIn,
    elasticOut: Easing.elasticOut,
    elasticInOut: Easing.elasticInOut,
    bounce: Easing.bounce,
    elastic: Easing.elastic,
};

function resolveEasing(type?: EasingType): (t: number) => number {
    return EASING_MAP[type ?? 'linear'];
}

// ---- Type detection ----

function isVector3(value: unknown): value is Vector3 {
    return (
        Array.isArray(value) &&
        value.length === 3 &&
        value.every((v) => typeof v === 'number')
    );
}

function isColor(value: unknown): value is string {
    return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
}

// ---- Color interpolation ----

/**
 * Converts a hex color string to RGB tuple.
 * @param hex Hex string (e.g., "#ff00aa").
 * @returns [r, g, b] with values 0-255.
 */
function hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Converts RGB tuple to hex color string.
 * @param r Red (0-255).
 * @param g Green (0-255).
 * @param b Blue (0-255).
 * @returns Hex string (e.g., "#ff00aa").
 */
function rgbToHex(r: number, g: number, b: number): string {
    return (
        '#' +
        [r, g, b]
            .map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, '0'))
            .join('')
    );
}

/**
 * Linearly interpolates between two hex colors.
 * @param a Start color.
 * @param b End color.
 * @param t Interpolation factor (0-1).
 * @returns Interpolated color string.
 */
function lerpColor(a: string, b: string, t: number): string {
    const [r1, g1, b1] = hexToRgb(a);
    const [r2, g2, b2] = hexToRgb(b);
    return rgbToHex(
        r1 + (r2 - r1) * t,
        g1 + (g2 - g1) * t,
        b1 + (b2 - b1) * t,
    );
}

// ---- Vector3 interpolation ----

/**
 * Linearly interpolates between two Vector3s.
 * @param a Start vector.
 * @param b End vector.
 * @param t Interpolation factor (0-1).
 * @returns Interpolated vector.
 */
function lerpVector3(a: Vector3, b: Vector3, t: number): Vector3 {
    return [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
    ];
}

// ---- Number interpolation ----

/**
 * Linearly interpolates between two numbers.
 * @param a Start value.
 * @param b End value.
 * @param t Interpolation factor (0-1).
 * @returns Interpolated value.
 */
function lerpNumber(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

// ---- Generic interpolation ----

function interpolateValue(a: number, b: number, t: number): number;
function interpolateValue(a: Vector3, b: Vector3, t: number): Vector3;
function interpolateValue(a: string, b: string, t: number): string;
function interpolateValue<T>(a: T, b: T, t: number): T;
function interpolateValue(a: unknown, b: unknown, t: number): unknown {
    if (typeof a === 'number' && typeof b === 'number') {
        return lerpNumber(a, b, t);
    }
    if (isVector3(a) && isVector3(b)) {
        return lerpVector3(a, b, t);
    }
    if (isColor(a) && isColor(b)) {
        return lerpColor(a, b, t);
    }
    // Boolean / string / unknown → step
    return t < 0.5 ? a : b;
}

// ---- Main interpolation function ----

/**
 * Interpolate a value at a given time from a sorted array of keyframes.
 *
 * Edge cases:
 * - No keyframes → returns undefined
 * - Single keyframe → returns that value
 * - Time before first keyframe → returns first value
 * - Time after last keyframe → returns last value (hold)
 * - Time between keyframes → interpolated with easing
 *
 * @template T Type of value to interpolate.
 * @param keyframes Array of keyframes (will be sorted by time).
 * @param time Target time in seconds.
 * @returns Interpolated value or undefined if no keyframes.
 */
export function interpolateKeyframes<T = unknown>(
    keyframes: Keyframe<T>[],
    time: number,
): T | undefined {
    if (keyframes.length === 0) return undefined;

    // Optimization: Check if already sorted to avoid O(N log N) sort
    let isSorted = true;
    for (let i = 0; i < keyframes.length - 1; i++) {
        if (keyframes[i].time > keyframes[i + 1].time) {
            isSorted = false;
            break;
        }
    }

    const sorted = isSorted ? keyframes : [...keyframes].sort((a, b) => a.time - b.time);

    // Before first keyframe
    if (time <= sorted[0].time) {
        return sorted[0].value;
    }

    // After last keyframe (hold last value)
    if (time >= sorted[sorted.length - 1].time) {
        return sorted[sorted.length - 1].value;
    }

    // Binary search for the two surrounding keyframes
    let low = 0;
    let high = sorted.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const kf = sorted[mid];

        if (kf.time === time) return kf.value;
        if (kf.time < time) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    // kf0 is just before time, kf1 is just after time
    const kf0 = sorted[high];
    const kf1 = sorted[low];

    const duration = kf1.time - kf0.time;
    if (duration <= 0) return kf1.value;

    const linearT = (time - kf0.time) / duration;
    const easingFn = resolveEasing(kf1.easing);
    const easedT = easingFn(linearT);

    return interpolateValue(kf0.value, kf1.value, easedT);
}

/**
 * Evaluate all tracks at a given time and return a map of
 * targetId → property → interpolated value.
 *
 * @param tracks List of animation tracks to evaluate.
 * @param time Target time in seconds.
 * @returns Nested map: Map<TargetId, Map<PropertyPath, Value>>
 */
export function evaluateTracksAtTime(
    tracks: { targetId: string; property: string; keyframes: Keyframe[] }[],
    time: number,
): Map<string, Map<string, unknown>> {
    const result = new Map<string, Map<string, unknown>>();

    for (const track of tracks) {
        const value = interpolateKeyframes(track.keyframes, time);
        if (value === undefined) continue;

        if (!result.has(track.targetId)) {
            result.set(track.targetId, new Map());
        }
        result.get(track.targetId)!.set(track.property, value);
    }

    return result;
}

// Re-export helpers for testing
export { lerpColor, lerpVector3, lerpNumber, hexToRgb, rgbToHex };
