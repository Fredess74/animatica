import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useHelper } from '@react-three/drei';
import { LightActor } from '../../types';

interface LightRendererProps {
  actor: LightActor;
  showHelper?: boolean;
}

/**
 * Renders a light actor (Point, Spot, Directional) with an optional helper gizmo.
 * Handles target positioning for directional/spot lights.
 */
export const LightRenderer: React.FC<LightRendererProps> = ({
  actor,
  showHelper = false,
}) => {
  const lightRef = useRef<THREE.Light>(null);
  const target = useMemo(() => new THREE.Object3D(), []);

  const { transform, visible, properties } = actor;
  const { lightType } = properties;

  const HelperClass = getHelperClass(lightType);

  (useHelper as any)(
    (showHelper && visible && HelperClass ? lightRef : null) as React.MutableRefObject<THREE.Object3D>,
    HelperClass,
    lightType === 'directional' ? 1 : 0.5,
    'yellow'
  );

  if (!visible) return null;

  return (
    <group
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
    >
      <primitive object={target} position={[0, 0, -1]} />
      <LightSource
        properties={properties}
        lightRef={lightRef}
        target={target}
      />
    </group>
  );
};

interface LightSourceProps {
  properties: LightActor['properties'];
  lightRef: React.RefObject<THREE.Light | null>;
  target: THREE.Object3D;
}

const LightSource: React.FC<LightSourceProps> = ({ properties, lightRef, target }) => {
  const { lightType, intensity, color, castShadow } = properties;

  switch (lightType) {
    case 'point':
      return <pointLight ref={lightRef as any} intensity={intensity} color={color} castShadow={castShadow} />;
    case 'spot':
      return <spotLight ref={lightRef as any} intensity={intensity} color={color} castShadow={castShadow} angle={Math.PI / 6} target={target} />;
    case 'directional':
      return <directionalLight ref={lightRef as any} intensity={intensity} color={color} castShadow={castShadow} target={target} />;
    default:
      return null;
  }
};

function getHelperClass(type: string) {
  switch (type) {
    case 'point':
      return THREE.PointLightHelper;
    case 'spot':
      return THREE.SpotLightHelper;
    case 'directional':
      return THREE.DirectionalLightHelper;
    default:
      return null;
  }
}
