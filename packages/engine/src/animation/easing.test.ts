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
    expect(Easing.easeInOut(0.25)).toBe(0.125); // < 0.5
    expect(Easing.easeInOut(0.5)).toBe(0.5);
    expect(Easing.easeInOut(0.75)).toBe(0.875); // >= 0.5
    expect(Easing.easeInOut(1)).toBe(1);
  });

  it('bounce', () => {
    expect(Easing.bounce(0)).toBe(0);
    expect(Easing.bounce(1)).toBeCloseTo(1);

    // Branch 1: t < 1/2.75 (~0.3636)
    expect(Easing.bounce(0.1)).toBeCloseTo(7.5625 * 0.1 * 0.1);

    // Branch 2: t < 2/2.75 (~0.7272)
    const t2 = 0.5;
    let t_calc2 = t2 - 1.5 / 2.75;
    expect(Easing.bounce(t2)).toBeCloseTo(7.5625 * t_calc2 * t_calc2 + 0.75);

    // Branch 3: t < 2.5/2.75 (~0.9090)
    const t3 = 0.8;
    let t_calc3 = t3 - 2.25 / 2.75;
    expect(Easing.bounce(t3)).toBeCloseTo(7.5625 * t_calc3 * t_calc3 + 0.9375);

    // Branch 4: t >= 2.5/2.75
    const t4 = 0.95;
    let t_calc4 = t4 - 2.625 / 2.75;
    expect(Easing.bounce(t4)).toBeCloseTo(7.5625 * t_calc4 * t_calc4 + 0.984375);
  });

  it('elastic', () => {
    expect(Easing.elastic(0)).toBe(0);
    expect(Easing.elastic(1)).toBe(1);
    // Check value
    const t = 0.5;
    expect(Easing.elastic(t)).toBeCloseTo(Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1);
  });

  it('step', () => {
    expect(Easing.step(0)).toBe(0);
    expect(Easing.step(0.5)).toBe(0);
    expect(Easing.step(0.999)).toBe(0);
    expect(Easing.step(1)).toBe(1);
  });
});
