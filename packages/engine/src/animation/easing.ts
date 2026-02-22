/**
 * Easing functions library.
 * All functions accept a normalized time 't' (0 to 1) and return an eased value.
 * While 't' is typically 0-1, it can be outside this range (e.g. for elastic/bounce).
 */

export const linear = (t: number): number => t;

export const quad = (t: number): number => t * t;

export const cubic = (t: number): number => t * t * t;

export const easeIn = (t: number): number => quad(t);

export const easeOut = (t: number): number => 1 - Math.pow(1 - t, 2);

export const easeInOut = (t: number): number => {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

export const bounce = (t: number): number => {
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

export const elastic = (t: number): number => {
  const c4 = (2 * Math.PI) / 3;
  return t === 0
    ? 0
    : t === 1
    ? 1
    : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

export const step = (t: number): number => {
  return t < 1 ? 0 : 1;
};
