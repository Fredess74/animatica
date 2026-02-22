import { describe, it, expect } from 'vitest';
import * as Easing from './easing';

describe('Easing Functions', () => {
  it('linear', () => {
    expect(Easing.linear(0)).toBe(0);
    expect(Easing.linear(0.5)).toBe(0.5);
    expect(Easing.linear(1)).toBe(1);
  });

  it('quad', () => {
    expect(Easing.quad(0)).toBe(0);
    expect(Easing.quad(0.5)).toBe(0.25);
    expect(Easing.quad(1)).toBe(1);
  });

  it('cubic', () => {
    expect(Easing.cubic(0)).toBe(0);
    expect(Easing.cubic(0.5)).toBe(0.125);
    expect(Easing.cubic(1)).toBe(1);
  });

  it('easeIn', () => {
    expect(Easing.easeIn(0)).toBe(0);
    expect(Easing.easeIn(0.5)).toBe(0.25);
    expect(Easing.easeIn(1)).toBe(1);
  });

  it('easeOut', () => {
    expect(Easing.easeOut(0)).toBe(0);
    expect(Easing.easeOut(0.5)).toBe(0.75);
    expect(Easing.easeOut(1)).toBe(1);
  });

  it('easeInOut', () => {
    expect(Easing.easeInOut(0)).toBe(0);
    expect(Easing.easeInOut(0.25)).toBe(0.125);
    expect(Easing.easeInOut(0.5)).toBe(0.5);
    expect(Easing.easeInOut(0.75)).toBe(0.875);
    expect(Easing.easeInOut(1)).toBe(1);
  });

  it('bounce', () => {
    expect(Easing.bounce(0)).toBe(0);
    // At t=1, it should be 1. Note: due to float precision, use toBeCloseTo
    expect(Easing.bounce(1)).toBeCloseTo(1);
    // Check intermediate value to ensure curve logic is hit
    // t=0.1: n1 * 0.1^2 = 7.5625 * 0.01 = 0.075625
    expect(Easing.bounce(0.1)).toBeCloseTo(0.075625);
  });

  it('elastic', () => {
    expect(Easing.elastic(0)).toBe(0);
    expect(Easing.elastic(1)).toBe(1);
    // Check intermediate value
    // t=0.5: 2^(-5) * sin((5 - 0.75) * c4) + 1
    // c4 = 2pi/3. (4.25) * 2pi/3 = 8.5pi/3 = 2.833pi.
    // sin(2.833pi) is positive.
    const val = Easing.elastic(0.5);
    expect(val).toBeGreaterThan(0);
    expect(val).toBeLessThan(2); // Should be somewhat reasonable
  });

  it('step', () => {
    expect(Easing.step(0)).toBe(0);
    expect(Easing.step(0.99)).toBe(0);
    expect(Easing.step(1)).toBe(1);
    expect(Easing.step(1.5)).toBe(1);
  });
});

describe('Additional Coverage', () => {
  it('bounce branches', () => {
    // t = 0.5 (between 1/2.75 ~0.36 and 2/2.75 ~0.72)
    // 2nd branch
    const d1 = 2.75;
    const n1 = 7.5625;
    let t = 0.5;
    t -= 1.5 / d1;
    const expected = n1 * t * t + 0.75;
    expect(Easing.bounce(0.5)).toBeCloseTo(expected);

    // t = 0.8 (between 2/2.75 ~0.72 and 2.5/2.75 ~0.90)
    // 3rd branch
    t = 0.8;
    t -= 2.25 / d1;
    const expected2 = n1 * t * t + 0.9375;
    expect(Easing.bounce(0.8)).toBeCloseTo(expected2);
  });
});
