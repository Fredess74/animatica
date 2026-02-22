import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Actor } from '../types';
import { PrimitiveRenderer } from './renderers/PrimitiveRenderer';
import { LightRenderer } from './renderers/LightRenderer';
import { CameraRenderer } from './renderers/CameraRenderer';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("SceneObject Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

interface SceneObjectProps {
  actor: Actor;
}

export const SceneObject: React.FC<SceneObjectProps> = ({ actor }) => {
  const renderActor = () => {
    switch (actor.type) {
      case 'primitive':
        return <PrimitiveRenderer actor={actor} />;
      case 'light':
        return <LightRenderer actor={actor} />;
      case 'camera':
        return <CameraRenderer actor={actor} />;
      // Future tasks:
      // case 'character': return <Humanoid actor={actor} />;
      // case 'speaker': return <SpeakerRenderer actor={actor} />;
      default:
        return null;
    }
  };

  // Fallback visual: small red box indicating error at actor's position
  const fallback = (
    <group position={actor.transform.position} scale={[0.5, 0.5, 0.5]}>
      <mesh>
        <boxGeometry />
        <meshBasicMaterial color="red" wireframe />
      </mesh>
    </group>
  );

  return (
    <ErrorBoundary fallback={fallback}>
      {renderActor()}
    </ErrorBoundary>
  );
};
