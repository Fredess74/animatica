import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock R3F useFrame
vi.mock('@react-three/fiber', async () => {
  const actual = await vi.importActual<typeof import('@react-three/fiber')>('@react-three/fiber');
  return {
    ...actual,
    useFrame: vi.fn(),
    useThree: () => ({
      gl: {
        domElement: document.createElement('canvas'),
      },
      scene: {},
      camera: {},
    }),
  };
});
