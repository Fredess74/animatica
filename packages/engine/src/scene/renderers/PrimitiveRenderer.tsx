import React from 'react';
import { PrimitiveActor } from '../../types';

interface PrimitiveRendererProps {
  actor: PrimitiveActor;
}

export const PrimitiveRenderer: React.FC<PrimitiveRendererProps> = ({ actor }) => {
  return (
    <group name={actor.name} position={actor.transform.position} rotation={actor.transform.rotation} scale={actor.transform.scale}>
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="gray" />
      </mesh>
    </group>
  );
};
