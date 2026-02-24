/**
 * Easing functions library for animation interpolation.
 * All functions accept a normalized time 't' (0 to 1) and return an eased value.
 * While 't' is typically 0-1, it can be outside this range (e.g. for elastic/bounce).
 *
 * @module @animatica/engine/animation/easing
 */

/**
 * Linear interpolation (no easing).
 * @param t Normalized time (0-1).
 * @returns The linear value (same as t).
 */
export const linear = (t: number): number => t;

/**
 * Quadratic ease-in.
 * @param t Normalized time (0-1).
 * @returns Eased value.
 */
export const quad = (t: number): number => t * t;

/**
 * Cubic ease-in.
 * @param t Normalized time (0-1).
 * @returns Eased value.
 */
export const cubic = (t: number): number => t * t * t;

/**
 * Alias for quadratic ease-in.
 */
export const easeIn = (t: number): number => quad(t);

/**
 * Quadratic ease-out.
 */
export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 2);

/**
 * Quadratic ease-in-out.
 */
export const easeInOut = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

// ---- Back Easing ----

export const backIn = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return c3 * t * t * t - c1 * t * t;
};

export const backOut = (t: number): number => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export const backInOut = (t: number): number => {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return t < 0.5
    ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
    : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
};

// ---- Elastic Easing ----

export const elasticIn = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
};

export const elasticOut = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

export const elasticInOut = (t: number): number => {
  const c5 = (2 * Math.PI) / 4.5;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : t < 0.5
    ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
    : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
};

// Alias for backward compatibility
export const elastic = elasticOut;

// ---- Bounce Easing ----

export const bounceOut = (t: number): number => {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
};

export const bounceIn = (t: number): number => {
  return 1 - bounceOut(1 - t);
};

export const bounceInOut = (t: number): number => {
  return t < 0.5
    ? (1 - bounceOut(1 - 2 * t)) / 2
    : (1 + bounceOut(2 * t - 1)) / 2;
};

// Alias for backward compatibility
export const bounce = bounceOut;

// ---- Spring Easing ----

/**
 * Spring easing using a damped harmonic oscillator.
 * Default parameters simulate a slightly bouncy spring.
 * @param t Normalized time (0-1).
 */
export const spring = (t: number): number => {
  return (
    -0.5 *
    Math.pow(Math.E, -6 * t) *
    (-2 * Math.pow(Math.E, 6 * t) + Math.sin(12 * t) + 2 * Math.cos(12 * t))
  );
};

// ---- Step Easing ----

/**
 * Step function (returns 0 if t < 1, else 1).
 */
export const step = (t: number): number => {
  return t < 1 ? 0 : 1;
};

// ---- Bezier ----

/**
 * Creates a cubic bezier easing function.
 * @param x1 Control point 1 x.
 * @param y1 Control point 1 y.
 * @param x2 Control point 2 x.
 * @param y2 Control point 2 y.
 * @returns A function (t) => easedValue.
 */
export const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
  // Simple implementation using Newton's method or lookup table would be ideal.
  // For simplicity here, we'll use a standard implementation.
  // Since we don't want external deps, let's implement a simple approximation
  // or use the standard `bezier-easing` approach if we could import it.
  // Given we must be pure and dep-free, let's just implement a simple solver.

  // Using a simplified version for this task. accurate solving of cubic bezier for X is needed.
  // x(t) = ...
  // We need to find T such that x(T) = time, then return y(T).

  const sampleValues = new Float32Array(11);
  for (let i = 0; i < 11; ++i) {
    sampleValues[i] = calcBezier(i * 0.1, x1, x2);
  }

  function A(aA1: number, aA2: number) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
  function B(aA1: number, aA2: number) { return 3.0 * aA2 - 6.0 * aA1; }
  function C(aA1: number) { return 3.0 * aA1; }

  function calcBezier(aT: number, aA1: number, aA2: number) {
    return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT;
  }

  function getSlope(aT: number, aA1: number, aA2: number) {
    return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1);
  }

  function getTForX(aX: number) {
    let intervalStart = 0.0;
    let currentSample = 1;
    const lastSample = 10;
    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += 0.1;
    }
    --currentSample;
    const dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    const guessForT = intervalStart + dist * 0.1;
    const initialSlope = getSlope(guessForT, x1, x2);
    if (initialSlope >= 0.001) {
      // Newton-Raphson
      let t = guessForT;
      for (let i = 0; i < 4; ++i) {
        const currentSlope = getSlope(t, x1, x2);
        if (currentSlope === 0.0) return t;
        const currentX = calcBezier(t, x1, x2) - aX;
        t -= currentX / currentSlope;
      }
      return t;
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      // Binary subdivision
      let aB = intervalStart + 0.1;
      let aA = intervalStart;
      let t = guessForT;
      let i = 0;
      while (Math.abs(t) > 0.0000001 && i < 10) {
        const currentX = calcBezier(t, x1, x2) - aX;
        if (Math.abs(currentX) > 0.0000001) {
            if (currentX > 0.0) aB = t; else aA = t;
            t = (aB + aA) * 0.5;
            i++;
        } else {
            break;
        }
      }
      return t;
    }
  }

  return (t: number): number => {
    if (x1 === y1 && x2 === y2) return t; // Linear
    if (t === 0 || t === 1) return t;
    return calcBezier(getTForX(t), y1, y2);
  };
};
