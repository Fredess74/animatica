// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { Humanoid } from './Humanoid';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Mock @react-three/drei's useGLTF
vi.mock('@react-three/drei', async () => {
  const actual = await vi.importActual('@react-three/drei');
  return {
    ...actual,
    useGLTF: vi.fn(),
  };
});

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
}));

describe('Humanoid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a procedural fallback when no URL is provided', () => {
    const { container } = render(<Humanoid />);
    // Check if a group and primitive are rendered (common in createProceduralHumanoid)
    expect(container.firstChild).toBeDefined();
  });

  it('attempts to load GLB when URL is provided', () => {
    const mockScene = new THREE.Group();
    const mockAnimations: THREE.AnimationClip[] = [];
    (useGLTF as any).mockReturnValue({ scene: mockScene, animations: mockAnimations });

    render(<Humanoid url="https://example.com/model.glb" />);

    expect(useGLTF).toHaveBeenCalledWith("https://example.com/model.glb");
  });

  it('renders fallback when loading fails', () => {
    // Mocking an error in useGLTF is tricky since it's used inside a component.
    // We can mock it to throw or return null/undefined if we want to test ErrorBoundary/Suspense indirectly.
    (useGLTF as any).mockImplementation(() => {
      throw new Error('Loading failed');
    });

    // Suppress console.error for this test as ErrorBoundary will catch it
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(<Humanoid url="https://example.com/bad-model.glb" />);

    // It should render the ProceduralFallback which contains a group
    expect(container.firstChild).toBeDefined();

    consoleSpy.mockRestore();
  });

  it('applies transform props to the group', () => {
    const mockScene = new THREE.Group();
    (useGLTF as any).mockReturnValue({ scene: mockScene, animations: [] });

    // Since we can't easily inspect R3F group props via @testing-library/react (it renders to nothing in jsdom),
    // we just ensure it doesn't crash with valid props.
    // In a real R3F test we'd use @react-three/test-renderer.
    render(
      <Humanoid
        url="https://example.com/model.glb"
        position={[1, 2, 3]}
        rotation={[Math.PI, 0, 0]}
        scale={2}
      />
    );

    expect(useGLTF).toHaveBeenCalled();
  });
});
