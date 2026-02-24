import { describe, it, expect } from 'vitest';
import {
    interpolateKeyframes,
    evaluateTracksAtTime,
    lerpColor,
    lerpVector3,
    hexToRgb,
    rgbToHex,
    interpolateBezier,
} from './interpolate';
import type { Keyframe, Vector3 } from '../types';

// ---- Helper data ----

const numericKeyframes: Keyframe<number>[] = [
    { time: 0, value: 0 },
    { time: 1, value: 10, easing: 'linear' },
    { time: 2, value: 20, easing: 'easeInOut' },
];

const vec3Keyframes: Keyframe<Vector3>[] = [
    { time: 0, value: [0, 0, 0] },
    { time: 2, value: [10, 20, 30], easing: 'linear' },
];

const colorKeyframes: Keyframe<string>[] = [
    { time: 0, value: '#000000' },
    { time: 1, value: '#ffffff', easing: 'linear' },
];

// ---- Tests ----

describe('interpolateKeyframes', () => {
    it('returns undefined for empty keyframes', () => {
        expect(interpolateKeyframes([], 0)).toBeUndefined();
    });

    it('returns value for single keyframe at any time', () => {
        const kf: Keyframe<number>[] = [{ time: 5, value: 42 }];
        expect(interpolateKeyframes(kf, 0)).toBe(42);
        expect(interpolateKeyframes(kf, 5)).toBe(42);
        expect(interpolateKeyframes(kf, 100)).toBe(42);
    });

    it('clamps to first value before first keyframe', () => {
        expect(interpolateKeyframes(numericKeyframes, -1)).toBe(0);
        expect(interpolateKeyframes(numericKeyframes, 0)).toBe(0);
    });

    it('clamps to last value after last keyframe (hold)', () => {
        expect(interpolateKeyframes(numericKeyframes, 3)).toBe(20);
        expect(interpolateKeyframes(numericKeyframes, 100)).toBe(20);
    });

    it('linearly interpolates numbers at midpoint', () => {
        const result = interpolateKeyframes(numericKeyframes, 0.5);
        expect(result).toBe(5); // halfway between 0 and 10
    });

    it('linearly interpolates numbers at exact keyframe time', () => {
        expect(interpolateKeyframes(numericKeyframes, 1)).toBe(10);
    });

    it('supports new easing functions (bounceOut)', () => {
        const kf: Keyframe<number>[] = [
            { time: 0, value: 0 },
            { time: 1, value: 1, easing: 'bounceOut' },
        ];
        // bounceOut at 0.5 is approx 0.765625 (using standard bounce formula)
        // Let's just check it is not 0.5 (linear) and is > 0.5
        const val = interpolateKeyframes(kf, 0.5) as number;
        expect(val).toBeGreaterThan(0.5);
        expect(val).toBeLessThan(1);
    });

    it('supports elasticIn', () => {
        const kf: Keyframe<number>[] = [
            { time: 0, value: 0 },
            { time: 1, value: 1, easing: 'elasticIn' },
        ];
        const val = interpolateKeyframes(kf, 0.5) as number;
        expect(val).not.toBe(0.5);
    });
});

describe('Vector3 interpolation', () => {
    it('interpolates Vec3 at midpoint', () => {
        const result = interpolateKeyframes(vec3Keyframes, 1) as Vector3;
        expect(result[0]).toBe(5);
        expect(result[1]).toBe(10);
        expect(result[2]).toBe(15);
    });

    it('returns start value at t=0', () => {
        const result = interpolateKeyframes(vec3Keyframes, 0) as Vector3;
        expect(result).toEqual([0, 0, 0]);
    });

    it('returns end value at t=end', () => {
        const result = interpolateKeyframes(vec3Keyframes, 2) as Vector3;
        expect(result).toEqual([10, 20, 30]);
    });
});

describe('Color interpolation', () => {
    it('interpolates black to white at midpoint', () => {
        const result = interpolateKeyframes(colorKeyframes, 0.5);
        expect(result).toBe('#808080');
    });

    it('returns start color at t=0', () => {
        expect(interpolateKeyframes(colorKeyframes, 0)).toBe('#000000');
    });

    it('returns end color at t=end', () => {
        expect(interpolateKeyframes(colorKeyframes, 1)).toBe('#ffffff');
    });
});

describe('Color helpers', () => {
    it('hexToRgb converts correctly', () => {
        expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
        expect(hexToRgb('#00ff00')).toEqual([0, 255, 0]);
        expect(hexToRgb('#0000ff')).toEqual([0, 0, 255]);
    });

    it('rgbToHex converts correctly', () => {
        expect(rgbToHex(255, 0, 0)).toBe('#ff0000');
        expect(rgbToHex(0, 128, 255)).toBe('#0080ff');
    });

    it('lerpVector3 works correctly', () => {
        const result = lerpVector3([0, 0, 0], [10, 20, 30], 0.5);
        expect(result).toEqual([5, 10, 15]);
    });

    it('lerpColor works correctly', () => {
        expect(lerpColor('#000000', '#ffffff', 0)).toBe('#000000');
        expect(lerpColor('#000000', '#ffffff', 1)).toBe('#ffffff');
    });
});

describe('Boolean/step interpolation', () => {
    it('steps boolean values', () => {
        const kf: Keyframe<boolean>[] = [
            { time: 0, value: false },
            { time: 1, value: true },
        ];
        expect(interpolateKeyframes(kf, 0.3)).toBe(false);
        expect(interpolateKeyframes(kf, 0.7)).toBe(true);
    });
});

describe('evaluateTracksAtTime', () => {
    it('evaluates multiple tracks at a given time', () => {
        const tracks = [
            {
                targetId: 'actor-1',
                property: 'transform.position',
                keyframes: [
                    { time: 0, value: [0, 0, 0] },
                    { time: 2, value: [10, 0, 0], easing: 'linear' as const },
                ],
            },
            {
                targetId: 'actor-1',
                property: 'opacity',
                keyframes: [
                    { time: 0, value: 0 },
                    { time: 1, value: 1, easing: 'linear' as const },
                ],
            },
        ];

        const result = evaluateTracksAtTime(tracks, 1);
        const actor1 = result.get('actor-1')!;
        expect(actor1.get('opacity')).toBe(1);
        const pos = actor1.get('transform.position') as Vector3;
        expect(pos[0]).toBe(5);
    });
});

describe('Bezier Path Interpolation', () => {
    it('interpolateBezier follows control points', () => {
        const p0: Vector3 = [0, 0, 0];
        const p1: Vector3 = [0, 10, 0]; // Control point pulling up
        const p2: Vector3 = [10, 10, 0]; // Control point pulling right
        const p3: Vector3 = [10, 0, 0];

        // At t=0.5, it should be somewhere in the middle-top
        const result = interpolateBezier(p0, p1, p2, p3, 0.5);

        // Expected value for cubic bezier at 0.5:
        // (1-t)^3*p0 + 3*(1-t)^2*t*p1 + 3*(1-t)*t^2*p2 + t^3*p3
        // 0.125*p0 + 0.375*p1 + 0.375*p2 + 0.125*p3
        // [0,0,0] + [0, 3.75, 0] + [3.75, 3.75, 0] + [1.25, 0, 0]
        // = [5, 7.5, 0]

        expect(result[0]).toBeCloseTo(5);
        expect(result[1]).toBeCloseTo(7.5);
        expect(result[2]).toBeCloseTo(0);
    });

    it('interpolateBezier start and end points', () => {
        const p0: Vector3 = [0, 0, 0];
        const p1: Vector3 = [5, 5, 5];
        const p2: Vector3 = [5, 5, 5];
        const p3: Vector3 = [10, 10, 10];

        expect(interpolateBezier(p0, p1, p2, p3, 0)).toEqual(p0);
        expect(interpolateBezier(p0, p1, p2, p3, 1)).toEqual(p3);
    });
});
