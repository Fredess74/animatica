import React from 'react';
import { CameraActor } from '../../types';

interface CameraRendererProps {
  actor: CameraActor;
}

export const CameraRenderer: React.FC<CameraRendererProps> = ({ actor }) => {
  return (
    <group name={actor.name} position={actor.transform.position} rotation={actor.transform.rotation}>
      <perspectiveCamera />
    </group>
  );
};
