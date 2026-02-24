import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid } from '@react-three/drei';
import { SceneManager, useSceneStore } from '@Animatica/engine';
import * as THREE from 'three';
import { clsx } from 'clsx';
import { Box, Move, RotateCw, Scaling, Video, Monitor, LayoutGrid, Square } from 'lucide-react';

type TransformMode = 'translate' | 'rotate' | 'scale';
type CameraView = 'PERSPECTIVE' | 'TOP' | 'FRONT' | 'SIDE';

/**
 * Helper component to handle camera positioning based on selected view.
 */
const CameraController: React.FC<{ view: CameraView }> = ({ view }) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    // Reset camera based on view
    const dist = 10;

    if (view === 'TOP') {
      camera.position.set(0, dist, 0);
      camera.rotation.set(-Math.PI / 2, 0, 0);
    } else if (view === 'FRONT') {
      camera.position.set(0, 0, dist);
      camera.rotation.set(0, 0, 0);
    } else if (view === 'SIDE') {
      camera.position.set(dist, 0, 0);
      camera.rotation.set(0, Math.PI / 2, 0);
    } else if (view === 'PERSPECTIVE') {
      camera.position.set(5, 5, 5);
      camera.lookAt(0, 0, 0);
    }

    // Reset orbit controls target
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  }, [view, camera]);

  return <OrbitControls ref={controlsRef} makeDefault args={[camera, gl.domElement]} />;
};

/**
 * Gizmo to manipulate the selected actor.
 * Syncs a dummy object with the actor's transform and updates the store on change.
 */
const SelectionGizmo: React.FC<{ mode: TransformMode }> = ({ mode }) => {
  const selectedActorId = useSceneStore((s) => s.selectedActorId);
  const selectedActor = useSceneStore((s) => s.actors.find((a) => a.id === selectedActorId));
  const updateActor = useSceneStore((s) => s.updateActor);

  const dummyRef = useRef<THREE.Group>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sync dummy with actor when selection changes or actor updates (if not dragging)
  useEffect(() => {
    if (selectedActor && dummyRef.current && !isDragging) {
      const { position, rotation, scale } = selectedActor.transform;
      dummyRef.current.position.set(...position);
      dummyRef.current.rotation.set(...rotation);
      dummyRef.current.scale.set(...scale);
    }
  }, [selectedActor, isDragging]);

  if (!selectedActor) return null;

  return (
    <>
      <TransformControls
        object={dummyRef}
        mode={mode}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onChange={() => {
          if (dummyRef.current && isDragging) {
             const { position, rotation, scale } = dummyRef.current;
             updateActor(selectedActor.id, {
               transform: {
                 position: [position.x, position.y, position.z],
                 rotation: [rotation.x, rotation.y, rotation.z],
                 scale: [scale.x, scale.y, scale.z],
               }
             });
          }
        }}
      />
      <group ref={dummyRef} />
    </>
  );
};

export const Viewport: React.FC = () => {
  const [transformMode, setTransformMode] = useState<TransformMode>('translate');
  const [cameraView, setCameraView] = useState<CameraView>('PERSPECTIVE');
  const selectedActorId = useSceneStore((s) => s.selectedActorId);
  const setSelectedActor = useSceneStore((s) => s.setSelectedActor);

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="flex bg-gray-800 rounded-md p-1 shadow-lg border border-gray-700">
           <button
             title="Translate (W)"
             className={clsx("p-2 rounded hover:bg-gray-700 text-white", transformMode === 'translate' && "bg-blue-600 hover:bg-blue-500")}
             onClick={() => setTransformMode('translate')}
           >
             <Move size={16} />
           </button>
           <button
             title="Rotate (E)"
             className={clsx("p-2 rounded hover:bg-gray-700 text-white", transformMode === 'rotate' && "bg-blue-600 hover:bg-blue-500")}
             onClick={() => setTransformMode('rotate')}
           >
             <RotateCw size={16} />
           </button>
           <button
             title="Scale (R)"
             className={clsx("p-2 rounded hover:bg-gray-700 text-white", transformMode === 'scale' && "bg-blue-600 hover:bg-blue-500")}
             onClick={() => setTransformMode('scale')}
           >
             <Scaling size={16} />
           </button>
        </div>

        <div className="flex bg-gray-800 rounded-md p-1 shadow-lg border border-gray-700 flex-col">
           <button
             title="Perspective"
             className={clsx("p-2 rounded hover:bg-gray-700 text-white", cameraView === 'PERSPECTIVE' && "bg-blue-600 hover:bg-blue-500")}
             onClick={() => setCameraView('PERSPECTIVE')}
           >
             <Video size={16} />
           </button>
           <button
             title="Top View"
             className={clsx("p-2 rounded hover:bg-gray-700 text-white", cameraView === 'TOP' && "bg-blue-600 hover:bg-blue-500")}
             onClick={() => setCameraView('TOP')}
           >
             <LayoutGrid size={16} />
           </button>
           <button
             title="Front View"
             className={clsx("p-2 rounded hover:bg-gray-700 text-white", cameraView === 'FRONT' && "bg-blue-600 hover:bg-blue-500")}
             onClick={() => setCameraView('FRONT')}
           >
             <Monitor size={16} />
           </button>
           <button
             title="Side View"
             className={clsx("p-2 rounded hover:bg-gray-700 text-white", cameraView === 'SIDE' && "bg-blue-600 hover:bg-blue-500")}
             onClick={() => setCameraView('SIDE')}
           >
             <Square size={16} />
           </button>
        </div>
      </div>

      <Canvas shadows dpr={[1, 2]} camera={{ position: [5, 5, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <CameraController view={cameraView} />

          <Grid
            infiniteGrid
            cellSize={1}
            sectionSize={5}
            fadeDistance={30}
            fadeStrength={1.5}
            sectionColor="#444"
            cellColor="#222"
          />

          <SceneManager
            selectedActorId={selectedActorId || undefined}
            onActorSelect={(id) => setSelectedActor(id)}
            showHelpers={true}
          />

          <SelectionGizmo mode={transformMode} />
        </Suspense>
      </Canvas>
    </div>
  );
};
