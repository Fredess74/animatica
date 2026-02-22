import React from 'react';
import { useSceneStore } from '../store/sceneStore';
import { SceneObject } from './SceneObject';

export const SceneManager: React.FC = () => {
  const actors = useSceneStore((state) => state.actors);
  const environment = useSceneStore((state) => state.environment);

  if (!environment) return null;

  return (
    <>
      {/* Environment Lights */}
      <ambientLight
        intensity={environment.ambientLight.intensity}
        color={environment.ambientLight.color}
      />
      <directionalLight
        position={environment.sun.position}
        intensity={environment.sun.intensity}
        color={environment.sun.color}
        castShadow
      />

      {/* Fog */}
      {environment.fog && (
        <fog attach="fog" args={[environment.fog.color, environment.fog.near, environment.fog.far]} />
      )}

      {/* Grid */}
      <gridHelper args={[20, 20]} />

      {/* Actors */}
      {actors.map((actor) => (
        <SceneObject key={actor.id} actor={actor} />
      ))}
    </>
  );
};
