import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid } from '@react-three/drei';
import { SceneManager, useSceneStore } from '@Animatica/engine';
import { Box, Eye, Monitor, Maximize } from 'lucide-react';

// --- Components ---

/**
 * Handles the TransformControls (Gizmo) for the selected actor.
 * Finds the 3D object by name (actor ID) and attaches controls to it.
 */
const Gizmo: React.FC<{ orbitRef: React.RefObject<any> }> = ({ orbitRef }) => {
    const selectedActorId = useSceneStore((s) => s.selectedActorId);
    const updateActor = useSceneStore((s) => s.updateActor);
    const { scene } = useThree();
    const [target, setTarget] = useState<THREE.Object3D | undefined>(undefined);

    // Find the object when selection changes
    useEffect(() => {
        if (!selectedActorId) {
            setTarget(undefined);
            return;
        }

        // We might need a small delay or retry if the object is just being mounted
        // but typically R3F mounts children before effects run here if structure is static.
        // Since selection usually happens on click (object exists), it should be fine.
        const obj = scene.getObjectByName(selectedActorId);
        if (obj) {
            setTarget(obj);
        } else {
            // Fallback or retry logic could go here
            setTarget(undefined);
        }
    }, [selectedActorId, scene]);

    if (!target || !selectedActorId) return null;

    return (
        <TransformControls
            object={target}
            mode="translate" // TODO: Add mode switching (rotate, scale)
            // @ts-ignore - onDraggingChanged is valid but types are missing
            onDraggingChanged={(e: any) => {
                if (orbitRef.current) {
                    orbitRef.current.enabled = !e.value;
                }
            }}
            onChange={(e: any) => {
                if (e?.target?.object) {
                    const obj = e.target.object;
                    // Sync changes back to store
                    // We need to convert THREE types to primitives
                    updateActor(selectedActorId, {
                        transform: {
                            position: [obj.position.x, obj.position.y, obj.position.z],
                            rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
                            scale: [obj.scale.x, obj.scale.y, obj.scale.z],
                        },
                    });
                }
            }}
        />
    );
};

/**
 * Toolbar for switching camera views.
 */
const CameraToolbar: React.FC<{
    onSetView: (position: [number, number, number]) => void;
}> = ({ onSetView }) => {
    return (
        <div className="absolute top-4 right-4 flex gap-2 bg-gray-800/80 p-2 rounded-lg backdrop-blur-sm">
            <button
                className="p-2 hover:bg-gray-700 rounded text-white"
                onClick={() => onSetView([0, 10, 0])}
                title="Top View"
            >
                <Box className="w-5 h-5" />
            </button>
            <button
                className="p-2 hover:bg-gray-700 rounded text-white"
                onClick={() => onSetView([0, 0, 10])}
                title="Front View"
            >
                <Monitor className="w-5 h-5" />
            </button>
             <button
                className="p-2 hover:bg-gray-700 rounded text-white"
                onClick={() => onSetView([10, 0, 0])}
                title="Side View"
            >
                <Maximize className="w-5 h-5" />
            </button>
            <button
                className="p-2 hover:bg-gray-700 rounded text-white"
                onClick={() => onSetView([10, 10, 10])}
                title="Perspective View"
            >
                <Eye className="w-5 h-5" />
            </button>
        </div>
    );
};

// Helper component to access camera from outside canvas via context/props bridge?
// No, we can put the logic inside a component inside Canvas.
const CameraController: React.FC<{
    viewPosition: [number, number, number] | null;
    setViewPosition: (pos: [number, number, number] | null) => void;
}> = ({ viewPosition, setViewPosition }) => {
    const { camera } = useThree();

    useEffect(() => {
        if (viewPosition) {
            camera.position.set(...viewPosition);
            camera.lookAt(0, 0, 0);
            setViewPosition(null); // Reset trigger
        }
    }, [viewPosition, camera, setViewPosition]);

    return null;
};

/**
 * The main Viewport component.
 */
export const Viewport: React.FC = () => {
    const orbitRef = useRef<any>(null);
    const [viewPosition, setViewPosition] = useState<[number, number, number] | null>(null);

    // Store actions
    const selectedActorId = useSceneStore((s) => s.selectedActorId);
    const setSelectedActor = useSceneStore((s) => s.setSelectedActor);

    const handleActorSelect = (id: string) => {
        setSelectedActor(id);
    };

    const handleMissedClick = () => {
        setSelectedActor(null);
    };

    return (
        <div className="relative w-full h-full bg-gray-900 overflow-hidden">
            <Canvas
                shadows
                camera={{ position: [10, 10, 10], fov: 50 }}
                onPointerMissed={handleMissedClick}
            >
                <OrbitControls ref={orbitRef} makeDefault />

                {/* Ground Plane */}
                <Grid
                    infiniteGrid
                    cellSize={1}
                    sectionSize={5}
                    fadeDistance={50}
                    sectionColor="#444"
                    cellColor="#222"
                />

                <SceneManager
                    selectedActorId={selectedActorId || undefined}
                    onActorSelect={handleActorSelect}
                    showHelpers={true}
                />

                <Gizmo orbitRef={orbitRef} />
                <CameraController viewPosition={viewPosition} setViewPosition={setViewPosition} />
            </Canvas>

            <CameraToolbar onSetView={setViewPosition} />
        </div>
    );
};
