import React from 'react';
import { LightActor } from '../../types';

interface LightRendererProps {
  actor: LightActor;
}

export const LightRenderer: React.FC<LightRendererProps> = ({ actor }) => {
  return (
    <group name={actor.name} position={actor.transform.position}>
      <pointLight intensity={1} />
    </group>
  );
};
