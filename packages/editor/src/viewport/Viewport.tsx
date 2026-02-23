import React from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Grid,
  GizmoHelper,
  GizmoViewport,
} from '@react-three/drei';
import { twMerge } from 'tailwind-merge';
import { SceneManager } from '@Animatica/engine';
import { EditorControls } from './EditorControls';

interface ViewportProps {
  /** ID of the currently selected actor. */
  selectedActorId?: string | null;
  /** Callback when selection changes. */
  onSelect?: (id: string | null) => void;
  /** ClassName for the container div. */
  className?: string;
}

/**
 * The main 3D viewport for the editor.
 * Renders the scene, grid, controls, and gizmos.
 */
export const Viewport: React.FC<ViewportProps> = ({
  selectedActorId,
  onSelect,
  className,
}) => {
  return (
    <div className={twMerge('w-full h-full bg-neutral-900', className)}>
      <Canvas
        shadows
        camera={{ position: [5, 5, 5], fov: 50 }}
        className="w-full h-full"
      >
        {/* Navigation Controls */}
        <OrbitControls makeDefault />

        {/* Scene Content */}
        <SceneManager
          selectedActorId={selectedActorId || undefined}
          onActorSelect={(id) => onSelect?.(id)}
          showHelpers={true}
        />

        {/* Editor Helpers */}
        <Grid
          infiniteGrid
          cellColor="#444"
          sectionColor="#666"
          fadeDistance={50}
        />

        {/* Transformation Gizmo */}
        <EditorControls selectedActorId={selectedActorId} />

        {/* Camera Orientation Gizmo */}
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport
            axisColors={['#ff3b30', '#4cd964', '#007aff']}
            labelColor="black"
          />
        </GizmoHelper>
      </Canvas>
    </div>
  );
};
