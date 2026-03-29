import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock THREE.js
vi.mock('three', async () => {
  const actual = await vi.importActual('three');
  return {
    ...actual,
    // Add any necessary mocks for Three.js here
  };
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

// Mock WebCodecs
if (typeof global.VideoEncoder === 'undefined') {
    (global as any).VideoEncoder = vi.fn();
    (global as any).VideoFrame = vi.fn();
    (global as any).EncodedVideoChunk = vi.fn();
}
