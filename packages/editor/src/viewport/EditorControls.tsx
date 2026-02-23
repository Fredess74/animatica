/// <reference types="three" />
import React, { useRef, useEffect, useState } from 'react';
import { TransformControls as DreiTransformControls } from '@react-three/drei';
import * as THREE from 'three';
import { useSceneStore, getActorById } from '@Animatica/engine';

interface EditorControlsProps {
  selectedActorId?: string | null;
}

/**
 * Handles the transformation gizmo logic using a dummy object strategy.
 * This avoids needing direct access to the SceneManager's internal meshes.
 */
export const EditorControls: React.FC<EditorControlsProps> = ({ selectedActorId }) => {
  const dummyRef = useRef<THREE.Object3D>(null);
  const [isDragging, setIsDragging] = useState(false);
  const updateActor = useSceneStore((state) => state.updateActor);

  // Select the actor from the store
  const selectedActor = useSceneStore((state) =>
    selectedActorId ? getActorById(selectedActorId)(state) : undefined
  );

  // Sync dummy object position/rotation/scale to the selected actor
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
    <DreiTransformControls
      mode="translate" // TODO: Add mode switching (translate/rotate/scale)
      onMouseDown={() => setIsDragging(true)}
      onMouseUp={() => setIsDragging(false)}
      onObjectChange={() => {
        if (dummyRef.current && selectedActorId) {
          const obj = dummyRef.current;
          updateActor(selectedActorId, {
            transform: {
              position: [obj.position.x, obj.position.y, obj.position.z],
              rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
              scale: [obj.scale.x, obj.scale.y, obj.scale.z],
            },
          });
        }
      }}
    >
      {/* Invisible dummy object acting as the target for TransformControls */}
      <object3D ref={dummyRef} />
    </DreiTransformControls>
  );
};
